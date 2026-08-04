import type * as React from "react";
import type {
	TourConfig as CoreTourConfig,
	TourStep as CoreTourStep,
} from "../core/types";

/**
 * React-flavoured step payload. `title` and `content` accept any renderable
 * node, so steps can carry JSX rather than plain strings.
 */
export interface TourStepMeta {
	title?: React.ReactNode;
	content?: React.ReactNode;
	[key: string]: unknown;
}

export type TourStep = CoreTourStep<TourStepMeta>;
export type TourConfig = CoreTourConfig<TourStepMeta>;
