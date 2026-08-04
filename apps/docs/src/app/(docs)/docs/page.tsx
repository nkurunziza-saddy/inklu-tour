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

type Option = {
	name: string;
	type: string;
	def: string;
	desc: string;
};

const BEHAVIOUR_OPTIONS: Option[] = [
	{
		name: "keyboardNavigation",
		type: "boolean",
		def: "true",
		desc: "Arrow keys step through the tour. Ignored while the user is typing.",
	},
	{
		name: "dismissOnEscape",
		type: "boolean",
		def: "true",
		desc: "Escape closes the tour.",
	},
	{
		name: "closeOnOutsideClick",
		type: "boolean",
		def: "false",
		desc: "A pointer press outside the card closes the tour.",
	},
	{
		name: "closeOnOverlayClick",
		type: "boolean",
		def: "false",
		desc: "Clicking the backdrop closes the tour.",
	},
	{
		name: "autoScroll",
		type: "boolean",
		def: "true",
		desc: "Scroll the target into view. Scrolls instantly under prefers-reduced-motion.",
	},
	{
		name: "labels",
		type: "TourLabels",
		def: "—",
		desc: "next, previous, finish, close, and stepCounter(current, total).",
	},
];

const APPEARANCE_OPTIONS: Option[] = [
	{
		name: "showSpotlight",
		type: "boolean",
		def: "true",
		desc: "Render the spotlight mask backdrop.",
	},
	{
		name: "spotlightPadding",
		type: "number",
		def: "8",
		desc: "Padding in pixels around the target cutout.",
	},
	{
		name: "spotlightRadius",
		type: "number",
		def: "target radius + 4",
		desc: "Override the cutout corner radius.",
	},
	{
		name: "maskOpacity",
		type: "number",
		def: "0.6",
		desc: "Backdrop darkness, 0 to 1.",
	},
	{
		name: "targetPulse",
		type: "boolean",
		def: "false",
		desc: "Pulse the highlight ring around the target.",
	},
	{
		name: "cardOffset",
		type: "number",
		def: "16",
		desc: "Gap in pixels between the target and the card.",
	},
	{
		name: "showArrow",
		type: "boolean",
		def: "true",
		desc: "Render the directional arrow on the card.",
	},
	{
		name: "zIndex",
		type: "number",
		def: "9998",
		desc: "Spotlight stacking order. The card renders at zIndex + 1.",
	},
];

const A11Y_OPTIONS: Option[] = [
	{
		name: "autoFocus",
		type: "boolean",
		def: "true",
		desc: "Move focus to the card when the tour opens.",
	},
	{
		name: "restoreFocus",
		type: "boolean",
		def: "true",
		desc: "Return focus to the previously focused element on close.",
	},
	{
		name: "announceSteps",
		type: "boolean",
		def: "true",
		desc: "Announce step changes through a polite live region.",
	},
	{
		name: "trapFocus",
		type: "boolean",
		def: "false",
		desc: "Confine Tab to the card and set aria-modal. Off by default.",
	},
];

function OptionTable({ rows }: { rows: Option[] }) {
	return (
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
					{rows.map((row) => (
						<tr key={row.name}>
							<td className="py-2 pr-4 font-mono text-foreground whitespace-nowrap">
								{row.name}
							</td>
							<td className="py-2 pr-4 font-mono whitespace-nowrap">
								{row.type}
							</td>
							<td className="py-2 pr-4 font-mono whitespace-nowrap">
								{row.def}
							</td>
							<td className="py-2">{row.desc}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

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
			<DocsHeader title="Documentation" date="Updated August 2026" />

			<div id="overview" />
			<DocsOverview>
				<p>
					<code>@inklu/tour</code> provides a state-driven, headless product
					tour system for React and Next.js. It handles DOM target tracking,
					smooth transitions, backdrop spotlight cutouts, focus management,
					keyboard navigation, and screen-reader announcements — and gets out of
					the way when you want to render your own UI.
				</p>
			</DocsOverview>

			<DocsSection id="installation" title="Installation">
				<p>
					Install <code>@inklu/tour</code> with your preferred package manager.{" "}
					<code>react</code> and <code>react-dom</code> (18 or 19) are peer
					dependencies.
				</p>
				<CommandBlock items={installCommands} />
				<Callout type="default" className="mt-4">
					<p>
						Import UI from <code>@inklu/tour/react</code>. The root{" "}
						<code>@inklu/tour</code> entry is the framework-agnostic engine and
						pulls in no React — see <a href="#core">Framework-agnostic core</a>.
					</p>
				</Callout>
			</DocsSection>

			<DocsSection id="agent-skill" title="Using this with a coding agent">
				<p>
					An agent skill ships alongside the library at{" "}
					<code>skills/inklu-tour</code>. It walks a coding agent through
					building a tour correctly — targeting, routing, the accessibility
					wiring, and the mistakes that are easy to make — and carries a full
					API reference and recipes. Install it via{" "}
					<a href="https://skills.sh" target="_blank" rel="noreferrer">
						skills.sh
					</a>
					:
				</p>
				<DocsCode
					code={SNIPPETS.skillInstall.code}
					html={highlighted.skillInstall}
				/>
			</DocsSection>

			<DocsSection id="quick-start" title="Quick Start">
				<p>
					Define your tours and wrap your app (or a subtree) in{" "}
					<code>TourProvider</code>. Use the <code>useTour</code> hook from any
					child component to start or stop them.
				</p>
				<DocsCode
					code={SNIPPETS.quickStart.code}
					html={highlighted.quickStart}
				/>
				<Callout type="default" className="mt-4">
					<p>
						<strong>Next.js App Router:</strong> the React entry ships the{" "}
						<code>"use client"</code> directive, so you can import it from a
						client component without extra wrappers.
					</p>
				</Callout>
				<DocsCode
					code={SNIPPETS.nextjsExample.code}
					html={highlighted.nextjsExample}
				/>
			</DocsSection>

			<DocsSection id="tour-provider" title="TourProvider & useTour">
				<p>
					<code>TourProvider</code> manages active tour state, route navigation
					triggers, and configuration that can change at runtime.
				</p>
				<DocsCode
					code={SNIPPETS.tourProviderConfig.code}
					html={highlighted.tourProviderConfig}
				/>
				<p className="mt-6">
					The <code>useTour</code> hook exposes the manager from anywhere inside
					the provider:
				</p>
				<DocsCode
					code={SNIPPETS.useTourApi.code}
					html={highlighted.useTourApi}
				/>
				<Callout type="default" className="mt-4">
					<p>
						<strong>Route navigation:</strong> when a step declares a{" "}
						<code>route</code>, <code>TourProvider</code> invokes your{" "}
						<code>onNavigate</code> callback (e.g.{" "}
						<code>router.push(route)</code>) as that step becomes active.
					</p>
				</Callout>
			</DocsSection>

			<DocsSection id="tour-targets" title="Target Configuration">
				<p>
					A target specifies which element to highlight. Pass a CSS selector
					string, or an object for timeout and strategy control.
				</p>
				<DocsCode
					code={SNIPPETS.targetConfig.code}
					html={highlighted.targetConfig}
				/>
				<p className="mt-6">
					Omitting <code>target</code> falls back to matching the step id
					against a <code>data-tour-step</code> attribute. This is the more
					durable option: it survives refactors that change class names or
					markup structure.
				</p>
				<DocsCode
					code={SNIPPETS.dataAttrTarget.code}
					html={highlighted.dataAttrTarget}
				/>
			</DocsSection>

			<DocsSection id="strategies" title="Strategies & Vanishing Targets">
				<p>
					When a step targets an element that is missing or loaded
					asynchronously, <code>TargetTracker</code> waits for it while showing
					a loading state, observing the DOM with a rAF-batched{" "}
					<code>MutationObserver</code>.
				</p>
				<ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
					<li>
						<code>strategy: "wait"</code> (default) – keep waiting indefinitely.
					</li>
					<li>
						<code>strategy: "skip"</code> – advance to the next step once{" "}
						<code>timeout</code> expires.
					</li>
					<li>
						<code>strategy: "error"</code> – report through <code>onError</code>{" "}
						and stay put.
					</li>
				</ul>
				<DocsCode
					code={SNIPPETS.errorStrategyExample.code}
					html={highlighted.errorStrategyExample}
				/>
				<Callout type="warning" className="mt-4">
					<p>
						<code>strategy: "error"</code> never throws. The timeout fires
						inside a timer callback where no <code>try/catch</code> in your code
						could catch it, so an uncaught throw would take down the host app.
						Handle it with <code>onError</code> instead.
					</p>
				</Callout>
			</DocsSection>

			<DocsSection id="accessibility" title="Accessibility">
				<p>
					The card renders as a <code>role="dialog"</code> labelled by the step
					title and described by the step content. Focus moves into it when the
					tour opens and returns to the previously focused element on close.
				</p>
				<p>
					It is deliberately <strong>not</strong> <code>aria-modal</code> unless
					you opt into <code>trapFocus</code>. A tour usually wants the user to
					interact with the element it is pointing at, and claiming modality
					while the rest of the page stays operable misrepresents the UI to
					screen readers.
				</p>
				<p>
					Because focus stays where the user put it as they step through, a
					polite live region carries the announcement instead. Arrow-key
					shortcuts are ignored when the event originates from an input,
					textarea, select, or contenteditable, so typing is never hijacked.
				</p>
				<DocsCode
					code={SNIPPETS.a11yExample.code}
					html={highlighted.a11yExample}
				/>
				<Callout type="warning" className="mt-4">
					<p>
						If you replace the default card with your own,{" "}
						<strong>
							wire <code>labelId</code> and <code>descriptionId</code>
						</strong>{" "}
						from <code>useTourContext()</code> onto your title and content
						elements. Without them the dialog has no accessible name or
						description.
					</p>
				</Callout>
			</DocsSection>

			<DocsSection id="components" title="Components & Composition">
				<p>
					<code>TourProvider</code> renders a built-in card out of the box. If
					you only want to own <code>open</code> and <code>stepIndex</code>{" "}
					yourself while keeping that card, use <code>Tour</code>:
				</p>
				<DocsCode
					code={SNIPPETS.controlledTour.code}
					html={highlighted.controlledTour}
				/>
				<Callout type="warning" className="mt-4">
					<p>
						<code>TourProvider</code>, <code>Tour</code>, and{" "}
						<code>TourRoot</code> are alternatives, not layers. Render exactly
						one of them.
					</p>
				</Callout>
				<p className="mt-6">
					For full control over the UI, compose the primitives yourself with{" "}
					<code>TourRoot</code>:
				</p>
				<DocsCode
					code={SNIPPETS.compositionExample.code}
					html={highlighted.compositionExample}
				/>
				<Steps className="mt-6">
					<Step>
						<strong>TourRoot</strong>
						<p>
							State engine wrapper that binds subscribers, tracks target
							rectangles, and owns keyboard and focus behaviour.
						</p>
					</Step>
					<Step>
						<strong>TourSpotlight</strong>
						<p>
							SVG backdrop with smooth cutout masks and optional pulse rings.
							Hidden from assistive technology, with a per-instance mask id so
							multiple tours never collide.
						</p>
					</Step>
					<Step>
						<strong>TourCard & TourArrow</strong>
						<p>
							Floating dialog that positions itself against the target anchor
							and flips side automatically when there isn't room.
						</p>
					</Step>
					<Step>
						<strong>
							TourNextButton / TourPreviousButton / TourCloseButton
						</strong>
						<p>
							Prewired controls. Call <code>preventDefault()</code> in your own{" "}
							<code>onClick</code> to cancel the built-in behaviour.
						</p>
					</Step>
				</Steps>
				<p className="mt-6">
					Every button supports <code>asChild</code> to render your own
					component:
				</p>
				<DocsCode
					code={SNIPPETS.asChildExample.code}
					html={highlighted.asChildExample}
				/>
			</DocsSection>

			<DocsSection id="i18n" title="Localisation">
				<p>
					All user-facing strings are overridable, including the step counter,
					which takes a function so you control word order and formatting.
				</p>
				<DocsCode
					code={SNIPPETS.i18nExample.code}
					html={highlighted.i18nExample}
				/>
			</DocsSection>

			<DocsSection id="audio-integration" title="Audio Integration">
				<p>
					<code>@inklu/tour</code> can play sound effects through{" "}
					<code>@inklu/audio</code>. It is an <strong>optional</strong> peer
					dependency, off by default, and imported on demand — projects that
					don't opt in never pay for it.
				</p>
				<DocsCode
					code={SNIPPETS.audioExample.code}
					html={highlighted.audioExample}
				/>
				<Callout type="default" className="mt-4">
					<p>
						If <code>enableAudio</code> is set but the package isn't installed,
						the tour logs a warning and carries on silently rather than
						crashing.
					</p>
				</Callout>
			</DocsSection>

			<DocsSection id="core" title="Framework-agnostic core">
				<p>
					The root <code>@inklu/tour</code> entry exports the engine, the target
					tracker, and the positioning helpers with no React dependency, for
					building your own adapter.
				</p>
				<DocsCode
					code={SNIPPETS.coreExample.code}
					html={highlighted.coreExample}
				/>
			</DocsSection>

			<DocsSection id="configuration" title="Configuration Reference">
				<p>
					Options on <code>TourConfigOptions</code>. They can be set on{" "}
					<code>TourProvider</code>, per tour, or per <code>TourRoot</code> —
					the most specific wins.
				</p>

				<h3 className="mt-6">Behaviour</h3>
				<OptionTable rows={BEHAVIOUR_OPTIONS} />

				<h3 className="mt-6">Appearance</h3>
				<OptionTable rows={APPEARANCE_OPTIONS} />

				<h3 className="mt-6">Accessibility</h3>
				<OptionTable rows={A11Y_OPTIONS} />

				<Accordion
					title="Can I change configuration while a tour is running?"
					className="mt-6"
				>
					Yes. <code>useTour().updateConfig(partial)</code> merges into the
					active configuration and takes effect immediately.
				</Accordion>

				<Accordion
					title="How do I render the tour inside a specific container?"
					className="mt-2"
				>
					Pass <code>container</code> to <code>TourProvider</code> or{" "}
					<code>TourRoot</code>. The card and spotlight portal there instead of{" "}
					<code>document.body</code> — useful inside dialogs or shadow hosts.
				</Accordion>

				<Accordion
					title="My tour restarts whenever the page re-renders."
					className="mt-2"
				>
					It shouldn't: the engine only re-tracks when a step's resolved target
					actually changes, so passing a fresh <code>tours</code> array literal
					on every render is safe. If you still see it, check that the step{" "}
					<code>id</code> and <code>target</code> are stable between renders.
				</Accordion>
			</DocsSection>
		</DocsFrame>
	);
}
