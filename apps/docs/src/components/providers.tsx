"use client";

import { type TourConfig, TourProvider } from "@inklu/tour/react";

const tours: TourConfig[] = [
	{
		id: "hero-tour",
		steps: [
			{
				id: "step-1",
				target: { selector: ".tour-step-1" },
				placement: "bottom-center",
				meta: {
					title: "Design Engineered",
					content:
						"The @inklu/tour package seamlessly handles positioning, focus management, and styling.",
				},
			},
			{
				id: "step-2",
				target: { selector: ".tour-step-2" },
				placement: "right-center",
				meta: {
					title: "Execute Commands",
					content:
						"You can copy and run these commands to install the library directly in your codebase.",
				},
			},
			{
				id: "step-3",
				target: { selector: ".tour-step-3" },
				placement: "top-center",
				meta: {
					title: "Start Writing",
					content:
						"Click this link to head over to the documentation and see how it works.",
				},
			},
		],
	},
];

export function Providers({ children }: { children: React.ReactNode }) {
	// `enableAudio` is opt-in — @inklu/audio is an optional peer dependency that
	// is only loaded when a project asks for it.
	return (
		<TourProvider tours={tours} enableAudio>
			{children}
		</TourProvider>
	);
}
