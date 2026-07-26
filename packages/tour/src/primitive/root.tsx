"use client";

import * as React from "react";
import { TOUR_EXIT_DURATION, TourContext } from "./context";
import type { TourConfig, TourConfigOptions } from "./types";
import { useTourTarget } from "./use-target";

export interface TourRootProps extends TourConfigOptions {
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
	closeOnOutsideClick: propCloseOnOutsideClick,
	closeOnOverlayClick: propCloseOnOverlayClick,
	keyboardNavigation: propKeyboardNavigation,
	dismissOnEscape: propDismissOnEscape,
	showSpotlight: propShowSpotlight,
	spotlightPadding: propSpotlightPadding,
	maskOpacity: propMaskOpacity,
	children,
}: TourRootProps) {
	const closeOnOutsideClick =
		propCloseOnOutsideClick ?? tour?.closeOnOutsideClick ?? false;
	const closeOnOverlayClick =
		propCloseOnOverlayClick ?? tour?.closeOnOverlayClick ?? false;
	const keyboardNavigation =
		propKeyboardNavigation ?? tour?.keyboardNavigation ?? true;
	const dismissOnEscape =
		propDismissOnEscape ?? tour?.dismissOnEscape ?? true;
	const showSpotlight = propShowSpotlight ?? tour?.showSpotlight ?? true;
	const spotlightPadding =
		propSpotlightPadding ?? tour?.spotlightPadding ?? 8;
	const maskOpacity = propMaskOpacity ?? tour?.maskOpacity ?? 0.6;

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
			if (e.key === "Escape" && dismissOnEscape) {
				handlersRef.current.handleClose();
			} else if (keyboardNavigation && e.key === "ArrowRight") {
				setSkipAnimation(true);
				handlersRef.current.handleNext();
			} else if (keyboardNavigation && e.key === "ArrowLeft") {
				setSkipAnimation(true);
				handlersRef.current.handlePrevious();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, dismissOnEscape, keyboardNavigation]);

	React.useEffect(() => {
		if (!open || !closeOnOutsideClick) return;
		const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
			const targetNode = e.target as Node | null;
			if (!targetNode) return;
			const cardEl = document.querySelector(".inklu-tour-card");
			if (cardEl && cardEl.contains(targetNode)) return;
			handlersRef.current.handleClose();
		};
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleOutsideClick);
			document.addEventListener("touchstart", handleOutsideClick);
		}, 50);
		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("touchstart", handleOutsideClick);
		};
	}, [open, closeOnOutsideClick]);

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
			closeOnOutsideClick,
			closeOnOverlayClick,
			keyboardNavigation,
			dismissOnEscape,
			showSpotlight,
			spotlightPadding,
			maskOpacity,
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
			closeOnOutsideClick,
			closeOnOverlayClick,
			keyboardNavigation,
			dismissOnEscape,
			showSpotlight,
			spotlightPadding,
			maskOpacity,
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
