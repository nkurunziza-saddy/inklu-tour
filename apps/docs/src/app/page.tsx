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
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { motion } from "motion/react";
import Link from "next/link";

export default function Home() {
	return (
		<SiteLayout
			header={<SiteHeader navItems={[{ label: "Docs", href: "/docs" }]} />}
			footer={
				<p className="text-sm font-medium text-muted-foreground">
					Built with{" "}
					<a href="https://inklu-docs.vercel.app" className="underline">
						Inklu
					</a>
					. MIT licensed.
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
						className="tracking-tight mb-2"
					>
						Welcome to Inklu
					</TextEffect>

					<TextEffect
						as="p"
						preset="blur"
						delay={0.2}
						className="text-muted-foreground mt-0 mb-8"
					>
						Your beautifully engineered documentation site is ready.
					</TextEffect>

					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
						className="not-typeset mb-12 tour-step-2"
					>
						<CommandBlock
							items={[
								{ id: "npm", command: "npm run dev" },
								{ id: "pnpm", command: "pnpm dev" },
								{ id: "yarn", command: "yarn dev" },
								{ id: "bun", command: "bun dev" },
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
						className="text-muted-foreground tour-step-1"
					>
						The @inklu/tour package lets you seamlessly guide users through your
						application with beautifully engineered, headless tours. It includes
						full keyboard navigation, focus management, and micro-interactions
						like this{" "}
						<HoverCard>
							<HoverCardTrigger
								render={
									<span className="cursor-help underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors">
										inline tool tip
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
										<h4 className="text-sm font-semibold">@inklu/tour</h4>
										<p className="text-sm">
											Polished tour primitives for React
										</p>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>{" "}
						right out of the box.
					</motion.p>

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
							Start writing documentation <ArrowRightIcon className="size-4" />
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
			onClick={() => startTour("demo-tour")}
			className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
		>
			Take a Tour
		</Button>
	);
}
