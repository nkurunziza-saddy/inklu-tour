"use client";

import * as React from "react";
import type { Rect, TourConfig, TourStep } from "./types";

export const TOUR_ANIMATION_DURATION = 250;
export const TOUR_EXIT_DURATION = 150;

export interface TourContextValue {
	tour: TourConfig | null;
	open: boolean;
	isAnimatingExit: boolean;
	currentStepIndex: number;
	currentStep: TourStep | null;
	totalSteps: number;

	isWaiting: boolean;
	rects: Rect[];
	rectsStepId: string | null;
	skipAnimation: boolean;
	reducedMotion: boolean;

	// Configuration options
	closeOnOutsideClick?: boolean;
	closeOnOverlayClick?: boolean;
	keyboardNavigation?: boolean;
	dismissOnEscape?: boolean;
	showSpotlight?: boolean;
	spotlightPadding?: number;
	maskOpacity?: number;
	spotlightRadius?: number;
	autoScroll?: boolean;
	cardOffset?: number;
	showArrow?: boolean;
	targetPulse?: boolean;
	labels?: { next?: string; previous?: string; finish?: string };

	next: () => void;
	previous: () => void;
	close: () => void;
	setStep: (index: number) => void;
}

export const TourContext = React.createContext<TourContextValue | null>(null);

export function useTourContext() {
	const ctx = React.use(TourContext);
	if (!ctx)
		throw new Error("Tour components must be rendered within <Tour.Root>");
	return ctx;
}
