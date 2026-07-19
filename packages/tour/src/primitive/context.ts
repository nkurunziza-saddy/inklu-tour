"use client";

import * as React from "react";
import type { Rect, TourConfig, TourStep } from "./types";

export const TOUR_ANIMATION_DURATION = 300;

export interface TourContextValue {
	tour: TourConfig | null;
	open: boolean;
	currentStepIndex: number;
	currentStep: TourStep | null;
	totalSteps: number;

	isWaiting: boolean;
	rects: Rect[];
	rectsStepId: string | null;

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
