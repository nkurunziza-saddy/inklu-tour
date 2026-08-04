export type TargetStrategy = "wait" | "skip" | "error";

export interface TourTargetConfig {
	selector: string;
	timeout?: number;
	strategy?: TargetStrategy;
}

export type StepTarget = string | TourTargetConfig;

/** Which edge of the target the card is anchored to. */
export type Side = "top" | "bottom" | "left" | "right";

/** How the card is aligned along that edge. */
export type Align = "start" | "center" | "end";

/**
 * Card placement relative to the target, e.g. `"bottom"`, `"bottom-start"`,
 * `"left-end"`. A bare side is equivalent to `${side}-center`.
 */
export type Placement = Side | `${Side}-${Align}`;

/**
 * Per-step payload rendered by the UI layer. Framework adapters narrow this:
 * the React entry types `title` and `content` as `React.ReactNode`.
 */
export interface TourStepMeta {
	title?: unknown;
	content?: unknown;
	[key: string]: unknown;
}

export interface TourStep<TMeta = TourStepMeta> {
	id: string;
	/**
	 * CSS selector, or a config object for timeout/strategy control. When
	 * omitted the step id is used as the target, matched against
	 * `[data-tour-step="<id>"]`.
	 */
	target?: StepTarget;
	placement?: Placement;
	/** Route to navigate to before this step becomes active. */
	route?: string;
	meta?: TMeta;
}

export interface TourLabels {
	next?: string;
	previous?: string;
	finish?: string;
	/** Accessible name for the close button. Defaults to "Close tour". */
	close?: string;
	/** Renders the "1 of 5" counter. Also used for the screen-reader announcement. */
	stepCounter?: (current: number, total: number) => string;
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

	/**
	 * Base stacking order. The spotlight renders at `zIndex`, the card at
	 * `zIndex + 1`. Defaults to 9998.
	 */
	zIndex?: number;
	/**
	 * Confine Tab focus to the tour card and mark it `aria-modal`. Off by
	 * default: tours usually want the highlighted element to stay reachable.
	 */
	trapFocus?: boolean;
	/** Move focus to the card when the tour opens. Defaults to true. */
	autoFocus?: boolean;
	/** Return focus to the previously focused element on close. Defaults to true. */
	restoreFocus?: boolean;
	/** Announce step changes to screen readers via a live region. Defaults to true. */
	announceSteps?: boolean;
}

export interface TourConfig<TMeta = TourStepMeta> {
	id: string;
	steps: TourStep<TMeta>[];
	config?: TourConfigOptions;
}

export interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
	radius: number;
}
