"use client";

import * as React from "react";
import { TourEngine } from "../core/machine";
import type { TourConfig, TourConfigOptions } from "../core/types";
import { TourContext } from "./context";

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
	children?: React.ReactNode;
	config?: TourConfigOptions;
}

const DEFAULT_CONFIG: TourConfigOptions = {
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
};

const EMPTY_STEPS: any[] = [];

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
	children,
	config: propConfig,
}: TourRootProps) {
	const config = React.useMemo<TourConfigOptions>(() => {
		return { ...DEFAULT_CONFIG, ...tour?.config, ...propConfig };
	}, [tour?.config, propConfig]);

	const steps = tour?.steps ?? EMPTY_STEPS;

	const [engine] = React.useState(() => new TourEngine());

	// Keep options fresh without triggering re-renders in the engine
	React.useEffect(() => {
		engine.setOptions({
			autoScroll: config.autoScroll ?? true,
			onTargetWaiting,
			onTargetFound,
			onTargetTimeout,
			onSkip: () => engine.next(),
			onStepChange,
			onOpenChange,
			onComplete,
			onDismiss,
		});
	});

	// Sync props to engine state
	React.useEffect(() => {
		engine.setProps(open, stepIndex, steps);
	}, [engine, open, stepIndex, steps]);

	// Cleanup on unmount
	React.useEffect(() => {
		return () => engine.destroy();
	}, [engine]);

	const engineState = React.useSyncExternalStore(
		(listener) => engine.subscribe(listener),
		() => engine.getState(),
		() => engine.getState(),
	);

	const [reducedMotion, setReducedMotion] = React.useState(false);
	React.useEffect(() => {
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReducedMotion(mql.matches);
		const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
		mql.addEventListener("change", listener);
		return () => mql.removeEventListener("change", listener);
	}, []);

	// Keyboard & Outside Click Adapters
	React.useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && config.dismissOnEscape) {
				engine.close();
			} else if (config.keyboardNavigation && e.key === "ArrowRight") {
				engine.setSkipAnimation(true);
				engine.next();
			} else if (config.keyboardNavigation && e.key === "ArrowLeft") {
				engine.setSkipAnimation(true);
				engine.previous();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [engine, open, config.dismissOnEscape, config.keyboardNavigation]);

	// Reset skip animation after it takes effect
	React.useEffect(() => {
		if (engineState.skipAnimation) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					engine.setSkipAnimation(false);
				});
			});
		}
	}, [engine, engineState.skipAnimation]);

	const contextValue = React.useMemo(
		() => ({
			tour,
			open: engineState.open,
			isAnimatingExit: engineState.isAnimatingExit,
			currentStepIndex: engineState.stepIndex,
			currentStep: engineState.currentStep,
			totalSteps: steps.length,
			isWaiting: engineState.isWaiting,
			rects: engineState.rects,
			rectsStepId: engineState.rectsStepId,
			skipAnimation: engineState.skipAnimation,
			reducedMotion,
			config,
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
			engine,
			onStepChange,
		],
	);

	if (!engineState.mounted) return null;

	return (
		<TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
	);
}
