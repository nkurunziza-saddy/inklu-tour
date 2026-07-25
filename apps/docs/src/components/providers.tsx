"use client";

import { type TourConfig, TourProvider } from "@inklu/tour";

const tours: TourConfig[] = [
	{
		id: "hero-tour",
		steps: [
			{
				id: "step-1",
				target: { selector: ".tgt-workspace" },
				placement: "right-center",
				meta: {
					title: "This is your workspace",
					content: "Everything you build lives here, organized by project.",
				},
			},
			{
				id: "step-2",
				target: { selector: ".tgt-new-project" },
				placement: "bottom-center",
				meta: {
					title: "Start something new",
					content: "One click creates a project with sane defaults.",
				},
			},
			{
				id: "step-3",
				target: { selector: ".tgt-chart" },
				placement: "top-center",
				meta: {
					title: "Live activity",
					content: "Updates as your team works, no refresh needed.",
				},
			},
		],
	},
];

export function Providers({ children }: { children: React.ReactNode }) {
	return <TourProvider tours={tours}>{children}</TourProvider>;
}
