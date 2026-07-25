"use client";

import { type TourConfig, TourProvider } from "@inklu/tour";

const tours: TourConfig[] = [
	{
		id: "demo-tour",
		steps: [
			{
				id: "step-1",
				target: { selector: ".tour-step-1" },
				placement: "bottom-center",
				meta: {
					title: "Welcome to Inklu Docs",
					content:
						"This is a demonstration of the highly polished, headless @inklu/tour package running inside a Next.js application.",
				},
			},
			{
				id: "step-2",
				target: { selector: ".tour-step-2" },
				placement: "right-center",
				meta: {
					title: "Execute Commands",
					content:
						"You can copy and run these commands to start your development server locally.",
				},
			},
			{
				id: "step-3",
				target: { selector: ".tour-step-3" },
				placement: "top-center",
				meta: {
					title: "Start Writing",
					content:
						"Click this link to head over to the documentation layout and see how navigation works seamlessly with the tour.",
				},
			},
		],
	},
];

export function Providers({ children }: { children: React.ReactNode }) {
	return <TourProvider tours={tours}>{children}</TourProvider>;
}
