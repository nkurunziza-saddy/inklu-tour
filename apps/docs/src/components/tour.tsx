"use client";

import * as React from "react";
import {
	TourArrow,
	TourCard,
	TourCloseButton,
	TourNextButton,
	TourPreviousButton,
	TourRoot,
	TourRootProps,
	TourSpotlight,
	useTourContext,
} from "@inklu/tour";
import { Cross2Icon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { motion } from "motion/react";

export function Tour(props: TourRootProps) {
	return (
		<TourRoot {...props}>
			<TourSpotlight
				fill="black"
				maskOpacity={0.6}
				stroke="var(--foreground)"
				strokeWidth={2}
				strokeOpacity={0.8}
			/>
			<TourCard asChild>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 10 }}
					transition={{ duration: 0.2 }}
					className="w-[320px] flex flex-col rounded-xl bg-background text-[13px] text-foreground border border-border shadow-xl outline-none"
				>
					<TourArrow className="bg-background border-border" />
					<TourCardContent />
				</motion.div>
			</TourCard>
		</TourRoot>
	);
}

function TourCardContent() {
	const { currentStep, currentStepIndex, totalSteps, isWaiting } = useTourContext();
	const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

	if (!currentStep) return null;

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex flex-col gap-2">
				<div className="flex items-start justify-between w-full gap-4">
					<div className="space-y-1">
						<div className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">
							Step {currentStepIndex + 1} of {totalSteps}
						</div>
						<div className="text-sm font-semibold tracking-tight text-foreground leading-tight">
							{currentStep.meta?.title ?? "Tour Step"}
						</div>
					</div>
					<TourCloseButton asChild>
						<button className="size-6 -mr-1 -mt-1 shrink-0 rounded-md text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
							<Cross2Icon className="size-4" />
							<span className="sr-only">Close tour</span>
						</button>
					</TourCloseButton>
				</div>
				{totalSteps > 1 && (
					<div className="h-0.5 w-full bg-secondary rounded-full overflow-hidden mt-1">
						<div
							className="h-full bg-foreground transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}
			</div>

			<div className="text-[13px] text-muted-foreground leading-relaxed">
				{currentStep.meta?.content}
			</div>

			<div className="flex items-center justify-between pt-1">
				<TourPreviousButton asChild>
					<button
						disabled={currentStepIndex === 0 || isWaiting}
						className="h-7 inline-flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
					>
						<ChevronLeftIcon className="-ml-1 size-3.5" />
						Previous
					</button>
				</TourPreviousButton>
				
				<TourNextButton asChild>
					<button
						disabled={isWaiting}
						className="h-7 inline-flex items-center justify-center gap-1 px-3 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 rounded-md disabled:opacity-50 transition-colors"
					>
						{isWaiting ? (
							<div className="size-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
						) : currentStepIndex === totalSteps - 1 ? (
							"Finish"
						) : (
							"Next"
						)}
						{!isWaiting && currentStepIndex < totalSteps - 1 && (
							<ChevronRightIcon className="-mr-0.5 size-3.5 opacity-80" />
						)}
					</button>
				</TourNextButton>
			</div>
		</div>
	);
}
