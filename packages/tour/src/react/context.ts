"use client";

import * as React from "react";
import type {
	Rect,
	TourConfig,
	TourConfigOptions,
	TourStep,
} from "../core/types";

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

	config: TourConfigOptions;

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
