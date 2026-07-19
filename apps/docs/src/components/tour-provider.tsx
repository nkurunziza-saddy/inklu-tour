"use client";

import * as React from "react";
import type { TourConfig } from "@inklu/tour";
import { Tour } from "./tour";
import { useRouter } from "next/navigation";

export interface TourProviderProps {
	tours: TourConfig[];
	children: React.ReactNode;
}

export interface TourManagerContextValue {
	startTour: (id: string) => void;
	stopTour: () => void;
}

export const TourManagerContext = React.createContext<TourManagerContextValue | null>(null);

export function useTour() {
	const ctx = React.useContext(TourManagerContext);
	if (!ctx) throw new Error("useTour must be used within a TourProvider");
	return ctx;
}

export function TourProvider({ tours, children }: TourProviderProps) {
	const [activeTourId, setActiveTourId] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [stepIndex, setStepIndex] = React.useState(0);
	const router = useRouter();

	const activeTour = React.useMemo(
		() => tours.find((t) => t.id === activeTourId) || null,
		[tours, activeTourId],
	);

	const handleNavigate = React.useCallback((route: string) => {
		router.push(route);
	}, [router]);

	const startTour = React.useCallback(
		(id: string) => {
			setActiveTourId(id);
			setStepIndex(0);
			setOpen(true);

			const tour = tours.find((t) => t.id === id);
			const route = tour?.steps[0]?.route;
			if (route) {
				handleNavigate(route);
			}
		},
		[tours, handleNavigate],
	);

	const stopTour = React.useCallback(() => {
		setOpen(false);
	}, []);

	const handleStepChange = React.useCallback(
		(newIndex: number) => {
			setStepIndex(newIndex);
			const route = activeTour?.steps[newIndex]?.route;
			if (route) {
				handleNavigate(route);
			}
		},
		[activeTour, handleNavigate],
	);

	return (
		<TourManagerContext.Provider value={{ startTour, stopTour }}>
			{children}
			<Tour
				tour={activeTour}
				open={open}
				onOpenChange={setOpen}
				stepIndex={stepIndex}
				onStepChange={handleStepChange}
				onDismiss={stopTour}
				onComplete={stopTour}
			/>
		</TourManagerContext.Provider>
	);
}
