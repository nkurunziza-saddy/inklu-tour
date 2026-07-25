"use client";

import {
	Button,
	CommandBlock,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
	Separator,
	SiteHeader,
	SiteLayout,
	TextEffect,
} from "@inklu/docs";
import { useTour } from "@inklu/tour";
import { SmoothCorners } from "@lisse/react";
import { ArrowRight, PlayCircle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import * as React from "react";

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
			<div className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-24 pb-32">
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
						className="not-typeset mb-14"
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
						Interactive Showcase
					</TextEffect>

					<motion.p
						initial={{ opacity: 0, filter: "blur(12px)" }}
						animate={{ opacity: 1, filter: "blur(0px)" }}
						transition={{ delay: 0.7, duration: 0.4 }}
					>
						Experience the capabilities of the library directly. Click the
						button below to start an interactive tour across the simulated
						dashboard.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
						className="not-typeset mt-10 mb-14"
					>
						<SmoothCorners corners={{ radius: 24, smoothing: 1 }} asChild>
							<div className="flex flex-col border border-border/50 relative overflow-hidden bg-background">
								<div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] pointer-events-none" />

								<div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-md">
									<span className="text-sm font-medium text-foreground">
										Live Preview
									</span>
									<TourStartButton />
								</div>

								<div className="relative z-10 flex-1 p-8 flex flex-col gap-8 min-h-[340px]">
									{/* Fake Header/Nav */}
									<div className="flex items-center justify-between gap-4">
										<div className="flex gap-4 tgt-workspace">
											<div className="text-sm font-medium text-foreground">
												Workspace
											</div>
											<div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default">
												Settings
											</div>
										</div>
										<div className="tgt-new-project">
											<Button
												size="sm"
												variant="outline"
												className="shadow-xs bg-background h-8"
											>
												Deploy
											</Button>
										</div>
									</div>

									{/* Fake Content Area */}
									<div className="flex-1 flex flex-col gap-4">
										<span className="text-sm font-medium text-muted-foreground">
											Activity
										</span>
										<div className="tgt-chart flex-1 rounded-xl border border-border/50 shadow-xs p-6 flex items-end gap-3 min-h-[180px] bg-background">
											{[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
												<div
													key={i}
													className="flex-1 bg-foreground/10 hover:bg-foreground/15 rounded-t-sm transition-all"
													style={{ height: `${h}%` }}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</SmoothCorners>
					</motion.div>

					<TextEffect as="h2" preset="fade-in-blur" per="word" delay={0.9}>
						Moving Forward
					</TextEffect>

					<TextEffect as="p" preset="blur" delay={1.0}>
						Start building your product tours with the care and empathy your
						users deserve. Keep the interface simple, and let the content do the
						heavy lifting.
					</TextEffect>

					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.1, duration: 0.4, ease: "easeOut" }}
						className="mt-8"
					>
						<Link
							href="/docs"
							className="inline-flex items-center gap-1 text-foreground hover:text-foreground/80 font-medium underline underline-offset-4 transition-colors"
						>
							Read the documentation{" "}
							<ArrowRight weight="duotone" className="size-3.5" />
						</Link>
					</motion.div>
				</div>
			</div>

			<TourToolbar />
		</SiteLayout>
	);
}

function TourToolbar() {
	const [style, setStyle] = React.useState("tooltip");
	const [showProgress, setShowProgress] = React.useState(false);

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 select-none">
			<div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/60 bg-background/90 p-1.5 shadow-2xl backdrop-blur-md transition-all duration-200 hover:border-border">
				{/* Style Selector */}
				<div className="flex items-center gap-1 bg-secondary/40 p-0.5 rounded-full border border-border/40">
					{(["tooltip", "spotlight", "modal"] as const).map((t) => {
						const active = style === t;
						return (
							<button
								key={t}
								type="button"
								onClick={() => setStyle(t)}
								className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
									active
										? "bg-background text-foreground shadow-xs border border-border/50"
										: "text-muted-foreground/75 hover:text-foreground hover:bg-background/40"
								}`}
							>
								{t.charAt(0).toUpperCase() + t.slice(1)}
							</button>
						);
					})}
				</div>

				<Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />

				<button
					type="button"
					onClick={() => setShowProgress(!showProgress)}
					className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
						showProgress
							? "text-foreground"
							: "text-muted-foreground/75 hover:text-foreground hover:bg-secondary/40"
					}`}
				>
					Progress Bar: {showProgress ? "On" : "Off"}
				</button>
			</div>
		</div>
	);
}

function TourStartButton() {
	const { startTour } = useTour();
	return (
		<Button
			type="button"
			onClick={() => startTour("hero-tour")}
			size="sm"
			className="h-8 text-xs px-4 shadow-none gap-1.5"
		>
			<PlayCircle weight="fill" className="size-4" /> Start Tour
		</Button>
	);
}
