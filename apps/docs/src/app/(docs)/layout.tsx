import {
	DocsLayout,
	DocsLayoutContent,
	DocsLayoutMain,
	DocsLayoutSidebar,
} from "@inklu/docs";
import {
	Code,
	Compass,
	Cpu,
	Sliders,
	SpeakerHigh,
	TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import type * as React from "react";

const LINKS = [
	{
		title: "Overview",
		url: "/docs#overview",
		isAnchor: true,
		icon: <Compass weight="duotone" className="size-4" />,
	},
	{
		title: "Installation",
		url: "/docs#installation",
		isAnchor: true,
		icon: <TerminalWindow weight="duotone" className="size-4" />,
	},
	{
		title: "Quick Start",
		url: "/docs#quick-start",
		isAnchor: true,
		icon: <Code weight="duotone" className="size-4" />,
	},
	{
		title: "Tour Provider & useTour",
		url: "/docs#tour-provider",
		isAnchor: true,
		icon: <Sliders weight="duotone" className="size-4" />,
	},
	{
		title: "Target Configuration",
		url: "/docs#tour-targets",
		isAnchor: true,
		icon: <Cpu weight="duotone" className="size-4" />,
	},
	{
		title: "Components & Composition",
		url: "/docs#components",
		isAnchor: true,
		icon: <Code weight="duotone" className="size-4" />,
	},
	{
		title: "Skip Strategies",
		url: "/docs#strategies",
		isAnchor: true,
		icon: <Sliders weight="duotone" className="size-4" />,
	},
	{
		title: "Audio Integration",
		url: "/docs#audio-integration",
		isAnchor: true,
		icon: <SpeakerHigh weight="duotone" className="size-4" />,
	},
	{
		title: "Configuration Reference",
		url: "/docs#configuration",
		isAnchor: true,
		icon: <Sliders weight="duotone" className="size-4" />,
	},
];

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<DocsLayout links={LINKS}>
			<DocsLayoutContent>
				<DocsLayoutSidebar />
				<DocsLayoutMain>{children}</DocsLayoutMain>
			</DocsLayoutContent>
		</DocsLayout>
	);
}
