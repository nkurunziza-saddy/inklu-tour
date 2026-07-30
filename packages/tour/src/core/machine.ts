import { TOUR_EXIT_DURATION } from "./constants";
import { TargetTracker } from "./tracker";
import type { Rect, TourStep } from "./types";

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
	onTargetWaiting?: (stepId: string) => void;
	onTargetFound?: (stepId: string) => void;
	onTargetTimeout?: (stepId: string) => void;
	onSkip?: () => void;
	onStepChange?: (stepIndex: number) => void;
	onOpenChange?: (open: boolean) => void;
	onComplete?: () => void;
	onDismiss?: () => void;
}

export class TourEngine {
	private state: TourEngineState;
	private steps: TourStep[] = [];
	private options: TourEngineOptions = {};
	private listeners = new Set<() => void>();
	private tracker: TargetTracker;
	private exitTimeoutId: number | null = null;

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
				this.state.isWaiting = false;
				if (this.state.currentStep) {
					this.options.onTargetFound?.(this.state.currentStep.id);
				}
				this.notify();
			},
			onTargetWaiting: () => {
				this.state.isWaiting = true;
				if (this.state.currentStep) {
					this.options.onTargetWaiting?.(this.state.currentStep.id);
				}
				this.notify();
			},
			onTargetTimeout: (strategy, selector) => {
				if (this.state.currentStep) {
					this.options.onTargetTimeout?.(this.state.currentStep.id);
				}
				if (strategy === "skip") {
					this.options.onSkip?.();
				} else if (strategy === "error") {
					throw new Error(`Tour target timeout: ${selector}`);
				}
			},
			onRectsChange: (rects) => {
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
		return () => this.listeners.delete(listener);
	}

	private notify() {
		this.state = { ...this.state };
		for (const listener of this.listeners) {
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
			...this.getTrackerOptions(),
		});
	}

	private getTrackerOptions() {
		return {
			onTargetFound: () => {
				this.state.isWaiting = false;
				if (this.state.currentStep) {
					this.options.onTargetFound?.(this.state.currentStep.id);
				}
				this.notify();
			},
			onTargetWaiting: () => {
				this.state.isWaiting = true;
				if (this.state.currentStep) {
					this.options.onTargetWaiting?.(this.state.currentStep.id);
				}
				this.notify();
			},
			onTargetTimeout: (
				strategy: "wait" | "skip" | "error",
				selector: string,
			) => {
				if (this.state.currentStep) {
					this.options.onTargetTimeout?.(this.state.currentStep.id);
				}
				if (strategy === "skip") {
					this.options.onSkip?.();
				} else if (strategy === "error") {
					throw new Error(`Tour target timeout: ${selector}`);
				}
			},
			onRectsChange: (rects: Rect[]) => {
				this.state.rects = rects;
				if (this.state.currentStep) {
					this.state.rectsStepId = this.state.currentStep.id;
				}
				this.notify();
			},
		};
	}

	setProps(open: boolean, stepIndex: number, steps: TourStep[]) {
		let changed = false;
		let stepChanged = false;

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
				if (this.exitTimeoutId) clearTimeout(this.exitTimeoutId);
			} else if (this.state.mounted) {
				this.state.isAnimatingExit = true;
				this.exitTimeoutId = window.setTimeout(() => {
					this.state.mounted = false;
					this.state.isAnimatingExit = false;
					this.notify();
				}, TOUR_EXIT_DURATION);
			}
		}

		if (this.state.stepIndex !== stepIndex || changed) {
			this.state.stepIndex = stepIndex;
			this.state.currentStep = steps[stepIndex] ?? null;
			changed = true;
			stepChanged = true;
		}

		if (changed) {
			if (stepChanged || !this.state.open) {
				this.syncTarget();
			}
			this.notify();
		}
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

	private syncTarget() {
		this.tracker.stop();

		const step = this.state.currentStep;
		if (!this.state.open || !step) {
			this.state.rects = [];
			this.state.rectsStepId = null;
			this.state.isWaiting = false;
			return;
		}

		this.tracker.track(step.target ?? step.id);
	}

	destroy() {
		this.tracker.stop();
		if (this.exitTimeoutId) clearTimeout(this.exitTimeoutId);
		this.listeners.clear();
	}
}
