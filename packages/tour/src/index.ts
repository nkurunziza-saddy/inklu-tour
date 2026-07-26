// Composed (batteries-included) — the default export

export type {
	TourProviderProps,
	TourSettingsMorphProps,
	UseTourReturn,
} from "./composed";
export { TourProvider, TourSettingsMorph, useTour } from "./composed";

// Re-export types that consumers need for tour configuration
export type {
	StepTarget,
	TargetStrategy,
	TourConfig,
	TourConfigOptions,
	TourStep,
	TourTargetConfig,
} from "./primitive/types";
