"use client";

import {
	Button,
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	CommandBlock,
	SiteHeader,
	SiteLayout,
	TextEffect,
} from "@inklu/docs";
import { useTour } from "@inklu/tour";
import { PlayIcon } from "@radix-ui/react-icons";

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
			<div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full pt-20 pb-32">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<TextEffect
						as="h1"
						preset="fade-in-blur"
						per="word"
						delay={0.1}
						className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
					>
						Product tours that live in your codebase.
					</TextEffect>
					<TextEffect
						as="p"
						preset="blur"
						delay={0.2}
						className="text-lg text-muted-foreground max-w-[600px] mx-auto mb-8 leading-relaxed"
					>
						Define steps once, in React. The tour handles the spotlight, the
						positioning, and the exit — no third-party overlay script required.
					</TextEffect>

					<div className="flex items-center justify-center">
						<div className="w-fit">
							<CommandBlock
								items={[
									{ id: "npm", command: "npm i @inklu/tour" },
									{ id: "pnpm", command: "pnpm add @inklu/tour" },
									{ id: "yarn", command: "yarn add @inklu/tour" },
									{ id: "bun", command: "bun add @inklu/tour" },
								]}
							/>
						</div>
					</div>
				</div>

				{/* The Stage */}
				<div className="grid lg:grid-cols-[1.15fr_1fr] gap-0 rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-background mt-16">
					{/* Left: Demo Panel (Live Preview) */}
					<div className="flex flex-col border-b lg:border-b-0 lg:border-r border-border/50 bg-secondary/10 relative overflow-hidden">
						{/* Subtle background pattern */}
						<div className="absolute inset-0 bg-[radial-gradient(#80808035_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

						<div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
							<span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
								Live Preview
							</span>
							<TourStartButton />
						</div>

						{/* Fake App */}
						<div className="relative z-10 flex-1 p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
							<div className="w-full sm:w-[160px] flex flex-row sm:flex-col gap-2 tgt-workspace">
								<div className="px-4 py-2.5 rounded-lg bg-secondary/60 text-sm font-medium text-foreground border border-border/50">
									Dashboard
								</div>
								<div className="px-4 py-2.5 rounded-lg hover:bg-secondary/30 text-sm font-medium text-muted-foreground transition-colors cursor-default">
									Projects
								</div>
								<div className="px-4 py-2.5 rounded-lg hover:bg-secondary/30 text-sm font-medium text-muted-foreground transition-colors cursor-default">
									Reports
								</div>
								<div className="px-4 py-2.5 rounded-lg hover:bg-secondary/30 text-sm font-medium text-muted-foreground transition-colors cursor-default">
									Settings
								</div>
							</div>

							<div className="flex-1 flex flex-col gap-6">
								<div className="flex items-center justify-between bg-background/50 border border-border/40 p-4 rounded-xl shadow-sm">
									<span className="text-sm font-medium text-foreground">
										Project Overview
									</span>
									<div className="tgt-new-project">
										<Button
											size="sm"
											variant="default"
											className="shadow-xs h-8 text-xs"
										>
											New Project
										</Button>
									</div>
								</div>

								<div className="tgt-chart flex-1 bg-card rounded-xl border border-border/50 shadow-xs p-6 flex items-end gap-3 min-h-[220px]">
									{[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
										<div
											key={i}
											className="flex-1 bg-primary/10 hover:bg-primary/20 transition-colors rounded-t-sm"
											style={{ height: `${h}%` }}
										/>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Right: Style Grid */}
					<div className="grid grid-cols-2 bg-background relative z-10">
						<Card className="rounded-none border-0 border-b border-r border-border/50 shadow-none flex flex-col p-6 min-h-[240px] bg-transparent hover:bg-secondary/5 transition-colors group">
							<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-6 tracking-widest uppercase">
								<span>01</span>
								<b className="text-foreground transition-colors">Tooltip</b>
							</div>
							<div className="flex-1 flex items-center justify-center mb-6">
								<div className="w-16 h-8 bg-card border border-border rounded-md shadow-sm opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
							</div>
							<div className="space-y-1.5">
								<h3 className="font-medium text-sm text-foreground">
									Anchored tooltip
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Points at one element, gracefully moves with scroll.
								</p>
							</div>
						</Card>

						<Card className="rounded-none border-0 border-b border-border/50 shadow-none flex flex-col p-6 min-h-[240px] bg-transparent hover:bg-secondary/5 transition-colors group">
							<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-6 tracking-widest uppercase">
								<span>02</span>
								<b className="text-foreground transition-colors">Spotlight</b>
							</div>
							<div className="flex-1 flex items-center justify-center mb-6 relative overflow-hidden">
								<div className="w-12 h-12 rounded-full border border-primary/30 shadow-[0_0_0_999px_rgba(0,0,0,0.05)] group-hover:shadow-[0_0_0_999px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-all duration-300" />
							</div>
							<div className="space-y-1.5">
								<h3 className="font-medium text-sm text-foreground">
									Dimmed spotlight
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Subtly darkens everything except the target element.
								</p>
							</div>
						</Card>

						<Card className="rounded-none border-0 border-b border-r border-border/50 shadow-none flex flex-col p-6 min-h-[240px] bg-transparent hover:bg-secondary/5 transition-colors group">
							<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-6 tracking-widest uppercase">
								<span>03</span>
								<b className="text-foreground transition-colors">Modal</b>
							</div>
							<div className="flex-1 flex items-center justify-center mb-6">
								<div className="w-24 h-14 bg-card border border-border rounded-lg shadow-md opacity-80 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300" />
							</div>
							<div className="space-y-1.5">
								<h3 className="font-medium text-sm text-foreground">
									Centered modal
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Perfect for general introductions with no single anchor.
								</p>
							</div>
						</Card>

						<Card className="rounded-none border-0 border-b border-border/50 shadow-none flex flex-col p-6 min-h-[240px] bg-transparent hover:bg-secondary/5 transition-colors group">
							<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-6 tracking-widest uppercase">
								<span>04</span>
								<b className="text-foreground transition-colors">Hotspot</b>
							</div>
							<div className="flex-1 flex items-center justify-center mb-6">
								<div className="w-2.5 h-2.5 rounded-full bg-primary relative">
									<div className="absolute inset-[-4px] rounded-full border border-primary animate-ping opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
								</div>
							</div>
							<div className="space-y-1.5">
								<h3 className="font-medium text-sm text-foreground">
									Pulsing hotspot
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									A quiet, non-blocking nudge without a forced tooltip.
								</p>
							</div>
						</Card>

						<Card className="rounded-none border-0 border-r border-border/50 shadow-none flex flex-col p-6 min-h-[240px] bg-transparent hover:bg-secondary/5 transition-colors group">
							<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-6 tracking-widest uppercase">
								<span>05</span>
								<b className="text-foreground transition-colors">Checklist</b>
							</div>
							<div className="flex-1 flex items-center justify-center mb-6">
								<div className="flex flex-col gap-2 w-24 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
									<div className="flex items-center gap-2">
										<div className="w-2.5 h-2.5 rounded-[2px] bg-primary" />
										<div className="h-1.5 w-16 bg-primary/20 rounded-full" />
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2.5 h-2.5 rounded-[2px] border border-border" />
										<div className="h-1.5 w-12 bg-border/50 rounded-full" />
									</div>
								</div>
							</div>
							<div className="space-y-1.5">
								<h3 className="font-medium text-sm text-foreground">
									Persistent checklist
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Self-paced, dismissible, and easily resumable.
								</p>
							</div>
						</Card>

						<Card className="rounded-none border-0 shadow-none flex flex-col p-6 min-h-[240px] bg-transparent hover:bg-secondary/5 transition-colors group">
							<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground mb-6 tracking-widest uppercase">
								<span>06</span>
								<b className="text-foreground transition-colors">Beacon</b>
							</div>
							<div className="flex-1 flex items-center justify-center mb-6">
								<div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" />
							</div>
							<div className="space-y-1.5">
								<h3 className="font-medium text-sm text-foreground">
									Passive beacon
								</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Marks a new feature permanently until it's clicked.
								</p>
							</div>
						</Card>
					</div>
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
			className="h-7 text-xs px-3 shadow-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90"
		>
			<PlayIcon className="size-3" /> Start Tour
		</Button>
	);
}
