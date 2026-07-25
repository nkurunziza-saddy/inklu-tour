"use client";

import * as React from "react";
import { TOUR_EXIT_DURATION, TourContext } from "./context";
import type { TourConfig } from "./types";
import { useTourTarget } from "./use-target";

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
	children,
}: TourRootProps) {
	const steps = tour?.steps ?? [];
	const currentStep = steps[stepIndex] ?? null;

	const [mounted, setMounted] = React.useState(open);
	const [isAnimatingExit, setIsAnimatingExit] = React.useState(false);
	const [skipAnimation, setSkipAnimation] = React.useState(false);
	const [reducedMotion, setReducedMotion] = React.useState(false);

	React.useEffect(() => {
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReducedMotion(mql.matches);
		const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
		mql.addEventListener("change", listener);
		return () => mql.removeEventListener("change", listener);
	}, []);

	React.useEffect(() => {
		if (open) {
			setMounted(true);
			setIsAnimatingExit(false);
		} else if (mounted) {
			setIsAnimatingExit(true);
			const t = setTimeout(() => {
				setMounted(false);
				setIsAnimatingExit(false);
			}, TOUR_EXIT_DURATION);
			return () => clearTimeout(t);
		}
	}, [open, mounted]);

	const handleNext = React.useCallback(() => {
		if (stepIndex < steps.length - 1) {
			onStepChange?.(stepIndex + 1);
		} else {
			onComplete?.();
			onOpenChange?.(false);
		}
	}, [stepIndex, steps.length, onStepChange, onComplete, onOpenChange]);

	const handlePrevious = React.useCallback(() => {
		if (stepIndex > 0) {
			onStepChange?.(stepIndex - 1);
		}
	}, [stepIndex, onStepChange]);

	const handleClose = React.useCallback(() => {
		onDismiss?.();
		onOpenChange?.(false);
	}, [onDismiss, onOpenChange]);

	const {
		rects,
		rectsStepId,
		isWaiting: targetIsWaiting,
	} = useTourTarget(open ? currentStep : null, {
		onTargetWaiting,
		onTargetFound,
		onTargetTimeout,
		onSkip: handleNext,
	});

	const isWaiting =
		targetIsWaiting || (currentStep ? rectsStepId !== currentStep.id : false);

	const handlersRef = React.useRef({ handleClose, handleNext, handlePrevious });
	React.useEffect(() => {
		handlersRef.current = { handleClose, handleNext, handlePrevious };
	}, [handleClose, handleNext, handlePrevious]);

	React.useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") handlersRef.current.handleClose();
			else if (e.key === "ArrowRight") {
				setSkipAnimation(true);
				handlersRef.current.handleNext();
			} else if (e.key === "ArrowLeft") {
				setSkipAnimation(true);
				handlersRef.current.handlePrevious();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	React.useEffect(() => {
		if (skipAnimation) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setSkipAnimation(false);
				});
			});
		}
	}, [stepIndex, skipAnimation]);

	const contextValue = React.useMemo(
		() => ({
			tour,
			open,
			isAnimatingExit,
			currentStepIndex: stepIndex,
			currentStep,
			totalSteps: steps.length,
			isWaiting,
			rects,
			rectsStepId,
			skipAnimation,
			reducedMotion,
			next: handleNext,
			previous: handlePrevious,
			close: handleClose,
			setStep: (idx: number) => onStepChange?.(idx),
		}),
		[
			tour,
			open,
			isAnimatingExit,
			stepIndex,
			currentStep,
			steps.length,
			isWaiting,
			rects,
			rectsStepId,
			skipAnimation,
			reducedMotion,
			handleNext,
			handlePrevious,
			handleClose,
			onStepChange,
		],
	);

	if (!mounted) return null;

	return (
		<TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
	);
}
