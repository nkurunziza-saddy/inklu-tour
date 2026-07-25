"use client";

import {
	Button,
	CommandBlock,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
	SiteHeader,
	SiteLayout,
	TextEffect,
} from "@inklu/docs";
import { useTour } from "@inklu/tour";
import { ArrowRight, PlayCircle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";

export default function Home() {
	return (
		<SiteLayout
			header={<SiteHeader navItems={[{ label: "Docs", href: "/docs" }]} />}
			footer={
				<p className="font-medium text-muted-foreground">
					Built by Saddy Nkurunziza. MIT licensed.
				</p>
			}
		>
			<div className="max-w-(--layout-content-width) mx-auto px-4 sm:px-6 w-full pt-24 pb-32">
				<div className="typeset typeset-docs">
					<TextEffect
						as="h1"
						preset="fade-in-blur"
						per="word"
						delay={0.1}
						className="mb-2"
					>
						inklu/tour
					</TextEffect>

					<TextEffect as="p" preset="blur" delay={0.2} className="mt-0 mb-10">
						Product tours that live in your codebase.
					</TextEffect>

					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
						className="not-typeset mb-14 tour-step-2"
					>
						<CommandBlock
							items={[
								{ id: "pnpm", command: "pnpm add @inklu/tour" },
								{ id: "npm", command: "npm install @inklu/tour" },
								{ id: "yarn", command: "yarn add @inklu/tour" },
								{ id: "bun", command: "bun add @inklu/tour" },
							]}
						/>
					</motion.div>

					<TextEffect as="h2" preset="fade-in-blur" per="word" delay={0.35}>
						Design Engineered
					</TextEffect>

					<motion.p
						initial={{ opacity: 0, filter: "blur(12px)" }}
						animate={{ opacity: 1, filter: "blur(0px)" }}
						transition={{ delay: 0.5, duration: 0.4 }}
						className="tour-step-1"
					>
						We believe in typography and invisible details. No massive
						third-party overlay scripts, just clean React components.
						Micro-interactions are carefully crafted. Define your steps once,
						and the library handles the positioning, focus management, and
						keyboard navigation. Like this{" "}
						<HoverCard>
							<HoverCardTrigger
								render={
									<span className="cursor-help underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors">
										inline tour hint
									</span>
								}
							/>
							<HoverCardContent
								side="top"
								sideOffset={6}
								align="start"
								className="w-80"
							>
								<div className="flex justify-between space-x-4">
									<div className="space-y-1">
										<h4 className="font-medium">Headless Architecture</h4>
										<p className="text-muted-foreground">
											Bring your own UI while we handle the complex math of
											bounding boxes and scroll boundaries.
										</p>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>{" "}
						to see our polished primitive composition at work.
					</motion.p>

					<TextEffect as="h2" preset="fade-in-blur" per="word" delay={0.6}>
						Moving Forward
					</TextEffect>

					<TextEffect as="p" preset="blur" delay={0.7}>
						Start building your product tours with the care and empathy your
						users deserve. Keep the interface simple, and let the content do the
						heavy lifting.
					</TextEffect>

					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
						className="mt-8 flex items-center gap-6"
					>
						<Link
							href="/docs"
							className="tour-step-3 inline-flex items-center gap-1 text-foreground hover:text-foreground/80 font-medium underline underline-offset-4 transition-colors"
						>
							Read the documentation{" "}
							<ArrowRight weight="duotone" className="size-3.5" />
						</Link>

						<TourStartButton />
					</motion.div>
				</div>
			</div>
		</SiteLayout>
	);
}

function TourStartButton() {
	const { startTour } = useTour();
	return (
		<Button
			type="button"
			onClick={() => startTour("hero-tour")}
			size="sm"
			className="h-9 shadow-xs gap-1.5"
		>
			<PlayCircle weight="fill" className="size-4" /> Start Tour
		</Button>
	);
}
