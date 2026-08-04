"use client";

import * as React from "react";
import type { TourConfigOptions } from "../../core/types";
import type { TourConfig } from "../types";
import { injectTourStyles } from "./styles";
import { Tour } from "./tour";

export interface TourProviderProps {
	tours: TourConfig[];
	/** Called when a step has a `route` property and becomes active. Wire your router here (e.g. `router.push`). */
	onNavigate?: (route: string) => void;
	/**
	 * Enable declarative audio via `@inklu/audio` data attributes. Requires
	 * `@inklu/audio` to be installed; it is loaded on demand and silently
	 * skipped when absent. Defaults to false.
	 */
	enableAudio?: boolean;
	/** Called when a step with `strategy: "error"` times out. */
	onError?: (error: Error) => void;
	/** Portal target for the card and spotlight. Defaults to `document.body`. */
	container?: Element | null;
	children: React.ReactNode;
	config?: TourConfigOptions;
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
	/** Index of the active step within the running tour. */
	stepIndex: number;
	/** Jump to a specific step of the running tour. */
	goToStep: (index: number) => void;
	/** Current active configuration options */
	config: TourConfigOptions;
	/** Update specific tour configuration options dynamically */
	updateConfig: (newConfig: Partial<TourConfigOptions>) => void;
}

const TourManagerContext = React.createContext<UseTourReturn | null>(null);

const EMPTY_TOURS: TourConfig[] = [];

/**
 * Access the tour manager from anywhere inside `<TourProvider>`.
 *
 * ```tsx
 * const { startTour, updateConfig } = useTour();
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
	enableAudio = false,
	onError,
	container = null,
	children,
	config: initialConfig,
}: TourProviderProps) {
	React.useEffect(() => {
		injectTourStyles();
	}, []);

	// Loaded on demand so consumers who don't opt into sound never pay for the
	// audio library — it is an optional peer dependency, not a hard one.
	React.useEffect(() => {
		if (!enableAudio) return;
		let cleanup: (() => void) | undefined;
		let cancelled = false;

		import("@inklu/audio")
			.then(({ observe }) => {
				if (cancelled) return;
				cleanup = observe();
			})
			.catch(() => {
				console.warn(
					"[@inklu/tour] enableAudio is set but @inklu/audio could not be loaded. Install it to enable tour sounds.",
				);
			});

		return () => {
			cancelled = true;
			cleanup?.();
		};
	}, [enableAudio]);

	const [activeTourId, setActiveTourId] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [stepIndex, setStepIndex] = React.useState(0);

	const [config, setConfigState] = React.useState<TourConfigOptions>(
		() => initialConfig ?? {},
	);

	const updateConfig = React.useCallback(
		(newConfig: Partial<TourConfigOptions>) => {
			setConfigState((prev) => ({ ...prev, ...newConfig }));
		},
		[],
	);

	const safeTours = tours ?? EMPTY_TOURS;

	// Keep a ref so `startTour` stays referentially stable even when callers
	// pass a new `tours` array literal on every render.
	const toursRef = React.useRef(safeTours);
	React.useEffect(() => {
		toursRef.current = safeTours;
	});

	const activeTour = React.useMemo(
		() => safeTours.find((t) => t.id === activeTourId) ?? null,
		[safeTours, activeTourId],
	);

	const navigateRef = React.useRef(onNavigate);
	React.useEffect(() => {
		navigateRef.current = onNavigate;
	}, [onNavigate]);

	const startTour = React.useCallback((id: string) => {
		const tour = toursRef.current.find((t) => t.id === id);
		if (!tour) {
			console.warn(`[@inklu/tour] No tour registered with id "${id}".`);
			return;
		}
		setActiveTourId(id);
		setStepIndex(0);
		setOpen(true);

		const route = tour.steps[0]?.route;
		if (route) navigateRef.current?.(route);
	}, []);

	const stopTour = React.useCallback(() => {
		setOpen(false);
	}, []);

	const activeTourIdRef = React.useRef(activeTourId);
	React.useEffect(() => {
		activeTourIdRef.current = activeTourId;
	}, [activeTourId]);

	const handleStepChange = React.useCallback((newIndex: number) => {
		setStepIndex(newIndex);
		const route = toursRef.current.find((t) => t.id === activeTourIdRef.current)
			?.steps[newIndex]?.route;
		if (route) navigateRef.current?.(route);
	}, []);

	const contextValue = React.useMemo<UseTourReturn>(
		() => ({
			startTour,
			stopTour,
			activeTourId,
			isActive: open,
			stepIndex,
			goToStep: handleStepChange,
			config,
			updateConfig,
		}),
		[
			startTour,
			stopTour,
			activeTourId,
			open,
			stepIndex,
			handleStepChange,
			config,
			updateConfig,
		],
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
				onError={onError}
				container={container}
				config={config}
			/>
		</TourManagerContext.Provider>
	);
}
