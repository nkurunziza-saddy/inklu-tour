export type TargetStrategy = "wait" | "skip" | "error";

export interface TourTargetConfig {
	selector: string;
	timeout?: number;
	strategy?: TargetStrategy;
}

export type StepTarget = string | TourTargetConfig;

export interface TourStep {
	id: string;
	target?: StepTarget;
	placement?: string;
	route?: string;
	meta?: Record<string, any>;
}

export interface TourConfigOptions {
	/** Close the tour when clicking outside the card/target */
	closeOnOutsideClick?: boolean;
	/** Close the tour when clicking directly on the spotlight backdrop overlay */
	closeOnOverlayClick?: boolean;
	/** Enable keyboard shortcuts (Arrow keys to step, Escape to close) */
	keyboardNavigation?: boolean;
	/** Enable Escape key to dismiss tour */
	dismissOnEscape?: boolean;
	/** Whether to show the spotlight mask overlay */
	showSpotlight?: boolean;
	/** Padding in pixels around the target spotlight cutout */
	spotlightPadding?: number;
	/** Dark background opacity for the spotlight overlay (0 to 1) */
	maskOpacity?: number;
}

export interface TourConfig extends TourConfigOptions {
	id: string;
	steps: TourStep[];
}

export interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
	radius: number;
}
