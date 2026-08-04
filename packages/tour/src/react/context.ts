"use client";

import * as React from "react";
import type { Rect, TourConfigOptions } from "../core/types";
import type { TourConfig, TourStep } from "./types";

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

	/** Element id for the card's accessible name. Wire to the step title. */
	labelId: string;
	/** Element id for the card's accessible description. Wire to the step content. */
	descriptionId: string;
	/** Portal target for the card and spotlight. `null` means `document.body`. */
	container: Element | null;

	next: () => void;
	previous: () => void;
	close: () => void;
	setStep: (index: number) => void;
}

export const TourContext = React.createContext<TourContextValue | null>(null);

export function useTourContext() {
	const ctx = React.useContext(TourContext);
	if (!ctx)
		throw new Error("Tour components must be rendered within <Tour.Root>");
	return ctx;
}
