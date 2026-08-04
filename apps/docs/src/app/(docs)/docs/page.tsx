import {
	Accordion,
	Callout,
	CommandBlock,
	DocsCode,
	DocsFrame,
	DocsHeader,
	DocsOverview,
	DocsSection,
	Step,
	Steps,
} from "@inklu/docs";
import { highlightSnippets } from "@inklu/docs/shiki";
import type { Metadata } from "next";
import { SNIPPETS } from "../../../lib/docs-snippets";

export const metadata: Metadata = {
	title: "Documentation - @inklu/tour",
	description: "Complete documentation and integration guide for @inklu/tour.",
};

export default async function DocsPage() {
	const highlighted = await highlightSnippets(SNIPPETS);

	const installCommands = [
		{ id: "pnpm", command: SNIPPETS.cmdPnpm.code, html: highlighted.cmdPnpm },
		{ id: "npm", command: SNIPPETS.cmdNpm.code, html: highlighted.cmdNpm },
		{ id: "yarn", command: SNIPPETS.cmdYarn.code, html: highlighted.cmdYarn },
		{ id: "bun", command: SNIPPETS.cmdBun.code, html: highlighted.cmdBun },
	];

	return (
		<DocsFrame>
			<DocsHeader title="Documentation" date="Updated July 2026" />

			<div id="overview" />
			<DocsOverview>
				<p>
					<code>@inklu/tour</code> provides a state-driven, headless product
					tour system designed for Next.js and React applications. It seamlessly
					handles DOM element target tracking, smooth transitions, backdrop
					spotlight cutouts, focus management, keyboard navigation, and audio
					feedback.
				</p>
			</DocsOverview>

			<DocsSection id="installation" title="Installation">
				<p>
					Install <code>@inklu/tour</code> into your project using your
					preferred package manager:
				</p>
				<CommandBlock items={installCommands} />
			</DocsSection>

			<DocsSection id="quick-start" title="Quick Start">
				<p>
					Define your tour configurations and wrap your app or subtree in{" "}
					<code>TourProvider</code>. Use the <code>useTour</code> hook from any
					child component to start or stop tours.
				</p>
				<DocsCode
					code={SNIPPETS.quickStart.code}
					html={highlighted.quickStart}
				/>
			</DocsSection>

			<DocsSection id="tour-provider" title="TourProvider & useTour">
				<p>
					<code>TourProvider</code> manages active tour states, route navigation
					triggers, and dynamic configuration options.
				</p>
				<DocsCode
					code={SNIPPETS.tourProviderConfig.code}
					html={highlighted.tourProviderConfig}
				/>
				<Callout type="default" className="mt-4">
					<p>
						<strong>Route Navigation:</strong> If a tour step specifies a{" "}
						<code>route</code> property, <code>TourProvider</code> will
						automatically invoke your <code>onNavigate</code> callback (e.g.{" "}
						<code>router.push(route)</code>) when that step becomes active.
					</p>
				</Callout>
			</DocsSection>

			<DocsSection id="tour-targets" title="Target Configuration">
				<p>
					Tour targets specify which element on the page should be highlighted.
					Targets can be passed as simple CSS selector strings or as detailed
					configuration objects.
				</p>
				<DocsCode
					code={SNIPPETS.targetConfig.code}
					html={highlighted.targetConfig}
				/>
			</DocsSection>

			<DocsSection id="components" title="Components & Composition">
				<p>
					While <code>TourProvider</code> renders a built-in responsive tour
					card out of the box, you can build custom tour interfaces using our
					decoupled compound primitives:
				</p>
				<DocsCode
					code={SNIPPETS.compositionExample.code}
					html={highlighted.compositionExample}
				/>
				<Steps className="mt-6">
					<Step>
						<strong>TourRoot</strong>
						<p>
							State engine wrapper that binds subscribers and manages target
							rectangles.
						</p>
					</Step>
					<Step>
						<strong>TourSpotlight</strong>
						<p>
							SVG backdrop layer with smooth cutout masks and optional target
							pulse focus rings.
						</p>
					</Step>
					<Step>
						<strong>TourCard & TourArrow</strong>
						<p>
							Floating card container that automatically positions relative to
							target anchors.
						</p>
					</Step>
				</Steps>
			</DocsSection>

			<DocsSection id="strategies" title="Skip Strategies & Vanishing Targets">
				<p>
					When a step targets an element that is missing or asynchronously
					loaded,
					<code>TargetTracker</code> can wait for it or automatically skip:
				</p>
				<ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
					<li>
						<code>strategy: "wait"</code> – Displays a subtle loading state
						while observing the DOM for element insertion via{" "}
						<code>MutationObserver</code>.
					</li>
					<li>
						<code>strategy: "skip"</code> – Automatically advances to the next
						step if the target element does not appear before the{" "}
						<code>timeout</code> expires.
					</li>
					<li>
						<code>strategy: "error"</code> – Throws a runtime error if the
						element is missing after timeout.
					</li>
				</ul>
			</DocsSection>

			<DocsSection id="audio-integration" title="Audio Integration">
				<p>
					<code>@inklu/tour</code> features built-in sound effects powered by{" "}
					<code>@inklu/audio</code>. Audio synthesis is enabled by default and
					can be customized using data attributes.
				</p>
				<DocsCode
					code={SNIPPETS.audioExample.code}
					html={highlighted.audioExample}
				/>
			</DocsSection>

			<DocsSection id="configuration" title="Configuration Reference">
				<p>
					Full options available on <code>TourConfigOptions</code>:
				</p>
				<div className="not-typeset my-4 overflow-x-auto">
					<table className="w-full text-left text-sm border-collapse">
						<thead>
							<tr className="border-b border-border text-foreground">
								<th className="py-2 pr-4 font-semibold">Option</th>
								<th className="py-2 pr-4 font-semibold">Type</th>
								<th className="py-2 pr-4 font-semibold">Default</th>
								<th className="py-2 font-semibold">Description</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/50 text-muted-foreground">
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									closeOnOutsideClick
								</td>
								<td className="py-2 pr-4 font-mono">boolean</td>
								<td className="py-2 pr-4 font-mono">false</td>
								<td className="py-2">Close tour when clicking outside card</td>
							</tr>
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									closeOnOverlayClick
								</td>
								<td className="py-2 pr-4 font-mono">boolean</td>
								<td className="py-2 pr-4 font-mono">false</td>
								<td className="py-2">
									Close tour when clicking backdrop overlay
								</td>
							</tr>
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									keyboardNavigation
								</td>
								<td className="py-2 pr-4 font-mono">boolean</td>
								<td className="py-2 pr-4 font-mono">true</td>
								<td className="py-2">Enable Arrow keys to step through tour</td>
							</tr>
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									dismissOnEscape
								</td>
								<td className="py-2 pr-4 font-mono">boolean</td>
								<td className="py-2 pr-4 font-mono">true</td>
								<td className="py-2">Enable Escape key to close tour</td>
							</tr>
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									showSpotlight
								</td>
								<td className="py-2 pr-4 font-mono">boolean</td>
								<td className="py-2 pr-4 font-mono">true</td>
								<td className="py-2">Render spotlight mask backdrop</td>
							</tr>
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									spotlightPadding
								</td>
								<td className="py-2 pr-4 font-mono">number</td>
								<td className="py-2 pr-4 font-mono">8</td>
								<td className="py-2">Padding around target spotlight cutout</td>
							</tr>
							<tr>
								<td className="py-2 pr-4 font-mono text-foreground">
									targetPulse
								</td>
								<td className="py-2 pr-4 font-mono">boolean</td>
								<td className="py-2 pr-4 font-mono">false</td>
								<td className="py-2">
									Add subtle pulse ring animation to target
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Accordion
					title="Can I use custom button label translations?"
					className="mt-6"
				>
					Yes! Pass custom button text in options via{" "}
					<code>
						labels: &#123; next: "Forward", previous: "Back", finish: "Done"
						&#125;
					</code>
					.
				</Accordion>
			</DocsSection>
		</DocsFrame>
	);
}
