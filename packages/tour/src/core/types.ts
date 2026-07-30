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

export interface TourLabels {
	next?: string;
	previous?: string;
	finish?: string;
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
	/** Custom corner radius for the spotlight cutout (defaults to target element radius + 4) */
	spotlightRadius?: number;
	/** Automatically scroll target elements into view */
	autoScroll?: boolean;
	/** Distance in pixels between the target element and the tour card */
	cardOffset?: number;
	/** Whether to render the directional arrow on the tour card */
	showArrow?: boolean;
	/** Add subtle pulse focus animation to the target spotlight ring */
	targetPulse?: boolean;
	/** Custom button label translations (Next, Prev, Finish) */
	labels?: TourLabels;
}

export interface TourConfig {
	id: string;
	steps: TourStep[];
	config?: TourConfigOptions;
}

export interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
	radius: number;
}
