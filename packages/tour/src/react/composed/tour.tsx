"use client";

import {
	TourArrow,
	TourCard,
	TourCloseButton,
	TourNextButton,
	TourPreviousButton,
	TourRoot,
	type TourRootProps,
	TourSpotlight,
	useTourContext,
} from "..";
import { defaultStepCounter } from "../root";

export type { TourRootProps };

/** Batteries-included tour UI. Compose `TourRoot` directly for full control. */
export function Tour(props: TourRootProps) {
	return (
		<TourRoot {...props}>
			<TourSpotlight
				fill="black"
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
	const {
		currentStep,
		currentStepIndex,
		totalSteps,
		isWaiting,
		config,
		labelId,
		descriptionId,
	} = useTourContext();

	if (!currentStep) return null;

	const labels = config.labels;
	const counter = labels?.stepCounter ?? defaultStepCounter;
	const isLastStep = currentStepIndex === totalSteps - 1;

	return (
		<div className="inklu-tour-body">
			<div className="inklu-tour-header">
				<div className="inklu-tour-header-row">
					<div
						className="inklu-tour-content-wrapper"
						key={`title-${currentStep.id}`}
					>
						<h2 className="inklu-tour-title" id={labelId}>
							{currentStep.meta?.title ?? "Tour Step"}
						</h2>
					</div>
					<TourCloseButton className="inklu-tour-close">
						<CloseIcon />
						<span className="inklu-tour-sr-only">
							{labels?.close ?? "Close tour"}
						</span>
					</TourCloseButton>
				</div>
			</div>

			<div
				className="inklu-tour-content inklu-tour-content-wrapper"
				id={descriptionId}
				key={`content-${currentStep.id}`}
			>
				{currentStep.meta?.content}
			</div>

			<div className="inklu-tour-footer">
				<div className="inklu-tour-footer-left">
					{totalSteps > 1 && (
						<div className="inklu-tour-step-counter">
							{counter(currentStepIndex + 1, totalSteps)}
						</div>
					)}
				</div>
				<div className="inklu-tour-footer-right">
					<TourPreviousButton
						className="inklu-tour-btn-prev"
						disabled={currentStepIndex === 0 || isWaiting}
					>
						{labels?.previous ?? "Prev"}
					</TourPreviousButton>

					<TourNextButton className="inklu-tour-btn-next" disabled={isWaiting}>
						{isWaiting ? (
							<>
								<span className="inklu-tour-spinner" aria-hidden="true" />
								<span className="inklu-tour-sr-only">Locating target</span>
							</>
						) : isLastStep ? (
							(labels?.finish ?? "Finish")
						) : (
							(labels?.next ?? "Next")
						)}
					</TourNextButton>
				</div>
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
			aria-hidden="true"
			focusable="false"
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
