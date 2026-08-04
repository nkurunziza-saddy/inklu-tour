"use client";

export {
	TOUR_ANIMATION_DURATION,
	TOUR_EXIT_DURATION,
} from "../core/constants";
export type { Position } from "../core/engine";
export {
	calculatePosition,
	rectsEqual,
	toRect,
	unionOf,
} from "../core/engine";
// Core types are re-exported here so React consumers need only one import path.
// `TourStep`/`TourConfig` come from ./types instead, with ReactNode-typed meta.
export type {
	Align,
	Placement,
	Rect,
	Side,
	StepTarget,
	TargetStrategy,
	TourConfigOptions,
	TourLabels,
	TourTargetConfig,
} from "../core/types";
export {
	Arrow as TourArrow,
	Card as TourCard,
	CloseButton as TourCloseButton,
	NextButton as TourNextButton,
	PreviousButton as TourPreviousButton,
	type TourArrowProps,
	type TourButtonProps,
	type TourCardProps,
} from "./card";
export type {
	TourProviderProps,
	TourSettingsMorphProps,
	UseTourReturn,
} from "./composed";
export {
	Tour,
	TourProvider,
	TourSettingsMorph,
	useTour,
} from "./composed";
export type { TourContextValue } from "./context";
export { TourContext, useTourContext } from "./context";
export type { TourRootProps } from "./root";
export { DEFAULT_CONFIG, Root as TourRoot } from "./root";
export type { TourSpotlightProps } from "./spotlight";
export { Spotlight as TourSpotlight } from "./spotlight";
export type { TourConfig, TourStep, TourStepMeta } from "./types";
