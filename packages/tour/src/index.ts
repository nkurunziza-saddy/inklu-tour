// Composed (batteries-included) — the default export

export type {
	TourProviderProps,
	TourSettingsMorphProps,
	UseTourReturn,
} from "./composed";
export { TourProvider, TourSettingsMorph, useTour } from "./composed";

// Audio re-exports from @inklu/audio
export { observe, sounds } from "@inklu/audio";

// Re-export types that consumers need for tour configuration
export type {
	StepTarget,
	TargetStrategy,
	TourConfig,
	TourConfigOptions,
	TourStep,
	TourTargetConfig,
} from "./primitive/types";
