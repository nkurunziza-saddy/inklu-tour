// Composed (batteries-included) — the default export
export { TourProvider, useTour } from "./composed";
export type { TourProviderProps, UseTourReturn } from "./composed";

// Re-export types that consumers need for tour configuration
export type {
	TourConfig,
	TourStep,
	TourTargetConfig,
	StepTarget,
	TargetStrategy,
} from "./primitive/types";
