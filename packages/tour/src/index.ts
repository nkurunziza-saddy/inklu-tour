// Composed (batteries-included) — the default export

export type { TourProviderProps, UseTourReturn } from "./composed";
export { TourProvider, useTour } from "./composed";

// Re-export types that consumers need for tour configuration
export type {
	StepTarget,
	TargetStrategy,
	TourConfig,
	TourStep,
	TourTargetConfig,
} from "./primitive/types";
