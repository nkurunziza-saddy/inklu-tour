"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { TourEngine } from "../core/machine";
import type { TourConfigOptions } from "../core/types";
import { TourContext, useTourContext } from "./context";
import type { TourConfig, TourStep } from "./types";
import { isFromEditableTarget, useIsMounted, useReducedMotion } from "./utils";

export interface TourRootProps {
	tour: TourConfig | null;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	stepIndex?: number;
	onStepChange?: (step: number) => void;
	onComplete?: () => void;
	onDismiss?: () => void;
	onTargetWaiting?: (stepId: string) => void;
	onTargetFound?: (stepId: string) => void;
	onTargetTimeout?: (stepId: string) => void;
	/** Called when a step with `strategy: "error"` times out. */
	onError?: (error: Error) => void;
	/** Portal target for the card and spotlight. Defaults to `document.body`. */
	container?: Element | null;
	children?: React.ReactNode;
	config?: TourConfigOptions;
}

export const DEFAULT_CONFIG: TourConfigOptions = {
	closeOnOutsideClick: false,
	closeOnOverlayClick: false,
	keyboardNavigation: true,
	dismissOnEscape: true,
	showSpotlight: true,
	spotlightPadding: 8,
	maskOpacity: 0.6,
	autoScroll: true,
	cardOffset: 16,
	showArrow: true,
	targetPulse: false,
	zIndex: 9998,
	trapFocus: false,
	autoFocus: true,
	restoreFocus: true,
	announceSteps: true,
};

const EMPTY_STEPS: TourStep[] = [];

export function defaultStepCounter(current: number, total: number) {
	return `${current} of ${total}`;
}

export function Root({
	tour,
	open = false,
	onOpenChange,
	stepIndex = 0,
	onStepChange,
	onComplete,
	onDismiss,
	onTargetWaiting,
	onTargetFound,
	onTargetTimeout,
	onError,
	container = null,
	children,
	config: propConfig,
}: TourRootProps) {
	const config = React.useMemo<TourConfigOptions>(() => {
		return { ...DEFAULT_CONFIG, ...tour?.config, ...propConfig };
	}, [tour?.config, propConfig]);

	const steps = tour?.steps ?? EMPTY_STEPS;

	const [engine] = React.useState(() => new TourEngine());
	const reducedMotion = useReducedMotion();
	const baseId = React.useId();
	const labelId = `${baseId}-title`;
	const descriptionId = `${baseId}-description`;

	// Re-run on every render so callbacks never go stale. The engine reads these
	// lazily, so refreshing them does not trigger any state change.
	React.useEffect(() => {
		engine.setOptions({
			autoScroll: config.autoScroll ?? true,
			reducedMotion,
			onTargetWaiting,
			onTargetFound,
			onTargetTimeout,
			onError,
			onSkip: () => engine.next(),
			onStepChange,
			onOpenChange,
			onComplete,
			onDismiss,
		});
	});

	React.useEffect(() => {
		engine.setProps(open, stepIndex, steps);
	}, [engine, open, stepIndex, steps]);

	React.useEffect(() => {
		return () => engine.destroy();
	}, [engine]);

	const engineState = React.useSyncExternalStore(
		(listener) => engine.subscribe(listener),
		() => engine.getState(),
		() => engine.getState(),
	);

	// Remember what had focus before the tour opened, and hand it back on close
	// so keyboard users aren't dumped at the top of the document.
	const previouslyFocused = React.useRef<HTMLElement | null>(null);
	const restoreFocus = config.restoreFocus ?? true;
	React.useEffect(() => {
		if (!open) return;
		previouslyFocused.current = document.activeElement as HTMLElement | null;
		return () => {
			const el = previouslyFocused.current;
			previouslyFocused.current = null;
			if (!restoreFocus || !el?.isConnected) return;
			el.focus({ preventScroll: true });
		};
	}, [open, restoreFocus]);

	React.useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			// Respect anything the app already handled, in-flight IME composition,
			// and shortcut combos that clearly aren't meant for the tour.
			if (e.defaultPrevented || e.isComposing) return;
			if (e.ctrlKey || e.metaKey || e.altKey) return;

			if (e.key === "Escape") {
				if (!config.dismissOnEscape) return;
				e.preventDefault();
				engine.close();
				return;
			}

			if (!config.keyboardNavigation) return;
			if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
			if (isFromEditableTarget(e)) return;

			e.preventDefault();
			engine.setSkipAnimation(true);
			if (e.key === "ArrowRight") engine.next();
			else engine.previous();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [engine, open, config.dismissOnEscape, config.keyboardNavigation]);

	React.useEffect(() => {
		if (!engineState.skipAnimation) return;
		// Two frames: one for the DOM to commit with transitions off, one to turn
		// them back on before the next step moves the card.
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => engine.setSkipAnimation(false));
		});
		return () => cancelAnimationFrame(frame);
	}, [engine, engineState.skipAnimation]);

	const contextValue = React.useMemo(
		() => ({
			tour,
			open: engineState.open,
			isAnimatingExit: engineState.isAnimatingExit,
			currentStepIndex: engineState.stepIndex,
			currentStep: engineState.currentStep as TourStep | null,
			totalSteps: steps.length,
			isWaiting: engineState.isWaiting,
			rects: engineState.rects,
			rectsStepId: engineState.rectsStepId,
			skipAnimation: engineState.skipAnimation,
			reducedMotion,
			config,
			labelId,
			descriptionId,
			container,
			next: () => engine.next(),
			previous: () => engine.previous(),
			close: () => engine.close(),
			setStep: (idx: number) => onStepChange?.(idx),
		}),
		[
			tour,
			engineState,
			steps.length,
			reducedMotion,
			config,
			labelId,
			descriptionId,
			container,
			engine,
			onStepChange,
		],
	);

	if (!engineState.mounted) return null;

	return (
		<TourContext.Provider value={contextValue}>
			{children}
			{config.announceSteps !== false && <StepAnnouncer />}
		</TourContext.Provider>
	);
}

/**
 * Screen-reader announcement for step changes. Focus deliberately stays where
 * the user put it, so a live region is what tells them the tour advanced.
 */
function StepAnnouncer() {
	const { currentStep, currentStepIndex, totalSteps, config, container, open } =
		useTourContext();
	const mounted = useIsMounted();
	const [message, setMessage] = React.useState("");

	const counter = config.labels?.stepCounter ?? defaultStepCounter;
	const title =
		typeof currentStep?.meta?.title === "string" ? currentStep.meta.title : "";
	const next = open
		? [title, counter(currentStepIndex + 1, totalSteps)]
				.filter(Boolean)
				.join(", ")
		: "";

	React.useEffect(() => {
		// Populate after the region is already in the accessibility tree —
		// content present at mount time is not announced.
		const id = setTimeout(() => setMessage(next), 60);
		return () => clearTimeout(id);
	}, [next]);

	if (!mounted) return null;

	return createPortal(
		<div
			role="status"
			aria-live="polite"
			aria-atomic="true"
			className="inklu-tour-sr-only"
		>
			{message}
		</div>,
		container ?? document.body,
	);
}
