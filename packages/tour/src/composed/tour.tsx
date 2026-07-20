"use client";

import * as React from "react";
import {
	TourArrow,
	TourCard,
	TourCloseButton,
	TourNextButton,
	TourPreviousButton,
	TourRoot,
	TourSpotlight,
	useTourContext,
} from "../primitive";
import type { TourRootProps } from "../primitive";

export type { TourRootProps };

export function Tour(props: TourRootProps) {
	return (
		<TourRoot {...props}>
			<TourSpotlight
				fill="black"
				maskOpacity={0.6}
				stroke="var(--tour-fg, currentColor)"
				strokeWidth={2}
				strokeOpacity={0.8}
			/>
			<TourCard className="inklu-tour-card">
				<TourArrow />
				<TourCardContent />
			</TourCard>
		</TourRoot>
	);
}

function TourCardContent() {
	const { currentStep, currentStepIndex, totalSteps, isWaiting } =
		useTourContext();
	const progress =
		totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

	if (!currentStep) return null;

	return (
		<div className="inklu-tour-body">
			<div className="inklu-tour-header">
				<div className="inklu-tour-header-row">
					<div>
						<div className="inklu-tour-step-counter">
							Step {currentStepIndex + 1} of {totalSteps}
						</div>
						<div className="inklu-tour-title">
							{currentStep.meta?.title ?? "Tour Step"}
						</div>
					</div>
					<TourCloseButton className="inklu-tour-close">
						<CloseIcon />
						<span className="inklu-tour-sr-only">Close tour</span>
					</TourCloseButton>
				</div>
				{totalSteps > 1 && (
					<div className="inklu-tour-progress">
						<div
							className="inklu-tour-progress-fill"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}
			</div>

			<div className="inklu-tour-content">{currentStep.meta?.content}</div>

			<div className="inklu-tour-footer">
				<TourPreviousButton
					className="inklu-tour-btn-prev"
					disabled={currentStepIndex === 0 || isWaiting}
				>
					<ChevronLeftIcon />
					Previous
				</TourPreviousButton>

				<TourNextButton
					className="inklu-tour-btn-next"
					disabled={isWaiting}
				>
					{isWaiting ? (
						<span className="inklu-tour-spinner" />
					) : currentStepIndex === totalSteps - 1 ? (
						"Finish"
					) : (
						"Next"
					)}
					{!isWaiting && currentStepIndex < totalSteps - 1 && (
						<ChevronRightIcon />
					)}
				</TourNextButton>
			</div>
		</div>
	);
}

/* ── Inline SVG icons (no external dependency) ───────────────────── */

function CloseIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
				fill="currentColor"
				fillRule="evenodd"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function ChevronLeftIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ marginLeft: -4 }}
		>
			<path
				d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
				fill="currentColor"
				fillRule="evenodd"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function ChevronRightIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ marginRight: -2, opacity: 0.8 }}
		>
			<path
				d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
				fill="currentColor"
				fillRule="evenodd"
				clipRule="evenodd"
			/>
		</svg>
	);
}
