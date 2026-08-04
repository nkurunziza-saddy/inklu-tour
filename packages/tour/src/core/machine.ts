import { TOUR_EXIT_DURATION } from "./constants";
import { TargetTracker } from "./tracker";
import type { Rect, StepTarget, TourStep } from "./types";

export type TourEngineState = {
	open: boolean;
	stepIndex: number;
	currentStep: TourStep | null;
	isWaiting: boolean;
	rects: Rect[];
	rectsStepId: string | null;
	mounted: boolean;
	isAnimatingExit: boolean;
	skipAnimation: boolean;
};

export interface TourEngineOptions {
	autoScroll?: boolean;
	reducedMotion?: boolean;
	onTargetWaiting?: (stepId: string) => void;
	onTargetFound?: (stepId: string) => void;
	onTargetTimeout?: (stepId: string) => void;
	onSkip?: () => void;
	onStepChange?: (stepIndex: number) => void;
	onOpenChange?: (open: boolean) => void;
	onComplete?: () => void;
	onDismiss?: () => void;
	/**
	 * Called when a step using `strategy: "error"` times out. Without a handler
	 * the error is logged — it must never be thrown, since it originates in a
	 * timer callback where nothing can catch it.
	 */
	onError?: (error: Error) => void;
}

/** Stable identity for "what this step points at", used to avoid needless retracking. */
function targetKey(target: StepTarget | undefined, fallbackId: string): string {
	const resolved = target ?? fallbackId;
	if (typeof resolved === "string") return `s:${resolved}`;
	return `o:${resolved.selector}|${resolved.timeout ?? ""}|${resolved.strategy ?? ""}`;
}

export class TourEngine {
	private state: TourEngineState;
	private steps: TourStep[] = [];
	private options: TourEngineOptions = {};
	private listeners = new Set<() => void>();
	private tracker: TargetTracker;
	private exitTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private destroyed = false;
	/** The target the tracker is currently watching, or null when idle. */
	private trackedKey: string | null = null;

	constructor() {
		this.state = {
			open: false,
			stepIndex: 0,
			currentStep: null,
			isWaiting: false,
			rects: [],
			rectsStepId: null,
			mounted: false,
			isAnimatingExit: false,
			skipAnimation: false,
		};

		this.tracker = new TargetTracker({
			onTargetFound: () => {
				if (this.destroyed) return;
				this.state.isWaiting = false;
				if (this.state.currentStep) {
					this.options.onTargetFound?.(this.state.currentStep.id);
				}
				this.notify();
			},
			onTargetWaiting: () => {
				if (this.destroyed) return;
				this.state.isWaiting = true;
				if (this.state.currentStep) {
					this.options.onTargetWaiting?.(this.state.currentStep.id);
				}
				this.notify();
			},
			onTargetTimeout: (strategy, selector) => {
				if (this.destroyed) return;
				if (this.state.currentStep) {
					this.options.onTargetTimeout?.(this.state.currentStep.id);
				}
				if (strategy === "skip") {
					this.options.onSkip?.();
				} else if (strategy === "error") {
					const error = new Error(`Tour target timeout: ${selector}`);
					if (this.options.onError) this.options.onError(error);
					else console.error(error);
				}
			},
			onRectsChange: (rects) => {
				if (this.destroyed) return;
				this.state.rects = rects;
				if (this.state.currentStep) {
					this.state.rectsStepId = this.state.currentStep.id;
				}
				this.notify();
			},
		});
	}

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify() {
		this.state = { ...this.state };
		for (const listener of [...this.listeners]) {
			listener();
		}
	}

	getState() {
		return this.state;
	}

	setOptions(options: TourEngineOptions) {
		this.options = options;
		this.tracker.setOptions({
			autoScroll: options.autoScroll,
			reducedMotion: options.reducedMotion,
		});
	}

	setProps(open: boolean, stepIndex: number, steps: TourStep[]) {
		// Reaching here means the owning component is mounted, so an earlier
		// teardown is over. React StrictMode and Fast Refresh unmount and
		// immediately remount effects while `useState` keeps this same instance
		// alive — treating `destroy()` as permanent would leave the tour inert for
		// the rest of the session in every development build.
		this.destroyed = false;

		let changed = false;

		if (this.steps !== steps) {
			this.steps = steps;
			changed = true;
		}

		if (this.state.open !== open) {
			this.state.open = open;
			changed = true;
			if (open) {
				this.state.mounted = true;
				this.state.isAnimatingExit = false;
				if (this.exitTimeoutId) {
					clearTimeout(this.exitTimeoutId);
					this.exitTimeoutId = null;
				}
			} else if (this.state.mounted) {
				this.state.isAnimatingExit = true;
				this.exitTimeoutId = setTimeout(() => {
					this.exitTimeoutId = null;
					if (this.destroyed) return;
					this.state.mounted = false;
					this.state.isAnimatingExit = false;
					this.notify();
				}, TOUR_EXIT_DURATION);
			}
		}

		const nextStep = steps[stepIndex] ?? null;
		if (
			this.state.stepIndex !== stepIndex ||
			this.state.currentStep !== nextStep
		) {
			this.state.stepIndex = stepIndex;
			this.state.currentStep = nextStep;
			changed = true;
		}

		// Retrack only when the thing being pointed at actually changes. Consumers
		// routinely pass a fresh `steps` array on every render; restarting the
		// tracker there would clear the rects, flash the waiting state, and
		// re-run the scroll-into-view on every parent re-render.
		const nextKey =
			this.state.open && nextStep
				? targetKey(nextStep.target, nextStep.id)
				: null;

		if (nextKey !== this.trackedKey) {
			this.trackedKey = nextKey;
			this.syncTarget(nextKey);
			changed = true;
		}

		if (changed) this.notify();
	}

	next() {
		if (this.state.stepIndex < this.steps.length - 1) {
			this.options.onStepChange?.(this.state.stepIndex + 1);
		} else {
			this.options.onComplete?.();
			this.options.onOpenChange?.(false);
		}
	}

	previous() {
		if (this.state.stepIndex > 0) {
			this.options.onStepChange?.(this.state.stepIndex - 1);
		}
	}

	close() {
		this.options.onDismiss?.();
		this.options.onOpenChange?.(false);
	}

	setSkipAnimation(skip: boolean) {
		if (this.state.skipAnimation !== skip) {
			this.state.skipAnimation = skip;
			this.notify();
		}
	}

	private syncTarget(nextKey: string | null) {
		this.tracker.stop();

		const step = this.state.currentStep;
		if (!nextKey || !step) {
			this.state.rects = [];
			this.state.rectsStepId = null;
			this.state.isWaiting = false;
			return;
		}

		this.tracker.track(step.target ?? step.id);
	}

	/**
	 * Release timers, listeners and the tracker. The `destroyed` flag only stops
	 * in-flight async callbacks from writing to a torn-down engine; a later
	 * `setProps` revives the instance, which is what makes StrictMode remounts
	 * work.
	 */
	destroy() {
		this.destroyed = true;
		this.tracker.stop();
		if (this.exitTimeoutId) clearTimeout(this.exitTimeoutId);
		this.exitTimeoutId = null;
		this.trackedKey = null;
		this.listeners.clear();
	}
}
