import { BrandLogo, DocsLayout, DocsNavbar, ThemeSwitcher } from "@inklu/docs";
import {
	Compass,
	PlayCircle,
	TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type * as React from "react";

const LINKS = [
	{
		group: "Getting Started",
		items: [
			{
				title: "Overview",
				url: "/docs",
				isAnchor: false,
				icon: <Compass weight="duotone" className="size-4" />,
			},
			{
				title: "Installation",
				url: "/docs/installation",
				isAnchor: false,
				icon: <TerminalWindow weight="duotone" className="size-4" />,
			},
		],
	},
	{
		group: "Core Concepts",
		collapsible: true,
		defaultOpen: true,
		items: [
			{
				title: "useTour Hook",
				url: "/docs/use-tour",
				isAnchor: false,
				icon: <PlayCircle weight="duotone" className="size-4" />,
			},
		],
	},
	{
		group: "Components",
		collapsible: true,
		defaultOpen: true,
		items: [
			{
				title: "Tour",
				url: "/docs/tour-component",
				isAnchor: false,
			},
			{
				title: "TourTarget",
				url: "/docs/tour-target",
				isAnchor: false,
			},
		],
	},
];

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<DocsLayout
			links={LINKS}
			header={
				<DocsNavbar
					logo={
						<Link
							href="/"
							aria-label="Home"
							className="flex items-center text-foreground transition-opacity hover:opacity-80"
						>
							<BrandLogo />
						</Link>
					}
					right={<ThemeSwitcher />}
				/>
			}
		>
			{children}
		</DocsLayout>
	);
}
