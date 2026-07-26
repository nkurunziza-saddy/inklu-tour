"use client";

import * as React from "react";
import type { TourConfig, TourConfigOptions } from "../primitive/types";
import { injectTourStyles } from "./styles";
import { Tour } from "./tour";

export interface TourProviderProps extends TourConfigOptions {
	tours: TourConfig[];
	/** Called when a step has a `route` property and becomes active. Wire your router here (e.g. `router.push`). */
	onNavigate?: (route: string) => void;
	children: React.ReactNode;
}

export interface UseTourReturn {
	/** Start a tour by its id. */
	startTour: (id: string) => void;
	/** Close the active tour. */
	stopTour: () => void;
	/** The id of the currently active tour, or null. */
	activeTourId: string | null;
	/** Whether a tour is currently open. */
	isActive: boolean;
	/** Current active configuration options */
	options: TourConfigOptions;
	/** Update specific tour configuration options dynamically */
	updateOptions: (newOptions: Partial<TourConfigOptions>) => void;
}

const TourManagerContext = React.createContext<UseTourReturn | null>(null);

/**
 * Access the tour manager from anywhere inside `<TourProvider>`.
 *
 * ```tsx
 * const { startTour, updateOptions } = useTour();
 * <button onClick={() => startTour("my-tour")}>Take a Tour</button>
 * ```
 */
export function useTour(): UseTourReturn {
	const ctx = React.useContext(TourManagerContext);
	if (!ctx) throw new Error("useTour must be used within a <TourProvider>");
	return ctx;
}

/**
 * Wrap your app (or a subtree) with `<TourProvider>` to enable tours.
 *
 * ```tsx
 * <TourProvider tours={[{ id: "onboarding", steps: [...] }]}>
 *   {children}
 * </TourProvider>
 * ```
 */
export function TourProvider({
	tours,
	onNavigate,
	children,
	closeOnOutsideClick = false,
	closeOnOverlayClick = false,
	keyboardNavigation = true,
	dismissOnEscape = true,
	showSpotlight = true,
	spotlightPadding = 8,
	maskOpacity = 0.6,
}: TourProviderProps) {
	React.useEffect(() => {
		injectTourStyles();
	}, []);

	const [activeTourId, setActiveTourId] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [stepIndex, setStepIndex] = React.useState(0);

	const [options, setOptionsState] = React.useState<TourConfigOptions>({
		closeOnOutsideClick,
		closeOnOverlayClick,
		keyboardNavigation,
		dismissOnEscape,
		showSpotlight,
		spotlightPadding,
		maskOpacity,
	});

	const updateOptions = React.useCallback(
		(newOptions: Partial<TourConfigOptions>) => {
			setOptionsState((prev) => ({ ...prev, ...newOptions }));
		},
		[],
	);

	const activeTour = React.useMemo(
		() => tours.find((t) => t.id === activeTourId) ?? null,
		[tours, activeTourId],
	);

	const navigateRef = React.useRef(onNavigate);
	React.useEffect(() => {
		navigateRef.current = onNavigate;
	}, [onNavigate]);

	const startTour = React.useCallback(
		(id: string) => {
			setActiveTourId(id);
			setStepIndex(0);
			setOpen(true);

			const tour = tours.find((t) => t.id === id);
			const route = tour?.steps[0]?.route;
			if (route) navigateRef.current?.(route);
		},
		[tours],
	);

	const stopTour = React.useCallback(() => {
		setOpen(false);
	}, []);

	const handleStepChange = React.useCallback(
		(newIndex: number) => {
			setStepIndex(newIndex);
			const route = activeTour?.steps[newIndex]?.route;
			if (route) navigateRef.current?.(route);
		},
		[activeTour],
	);

	const contextValue = React.useMemo<UseTourReturn>(
		() => ({
			startTour,
			stopTour,
			activeTourId,
			isActive: open,
			options,
			updateOptions,
		}),
		[startTour, stopTour, activeTourId, open, options, updateOptions],
	);

	return (
		<TourManagerContext.Provider value={contextValue}>
			{children}
			<Tour
				tour={activeTour}
				open={open}
				onOpenChange={setOpen}
				stepIndex={stepIndex}
				onStepChange={handleStepChange}
				onDismiss={stopTour}
				onComplete={stopTour}
				{...options}
			/>
		</TourManagerContext.Provider>
	);
}
