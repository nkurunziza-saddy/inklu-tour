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

export interface TourConfig {
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
