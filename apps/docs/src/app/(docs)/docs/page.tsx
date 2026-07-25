import { DocsFrame, DocsHeader, DocsOverview, DocsSection } from "@inklu/docs";

export default function OverviewDocsPage() {
	return (
		<DocsFrame>
			<DocsHeader title="Overview" date="Updated July 2026" />

			<DocsOverview>
				<p>
					<code>@inklu/tour</code> provides a fully robust, state-driven tour
					system that elegantly anchors to your DOM elements, handles keyboard
					navigation, manages focus, and supports seamless React composition.
				</p>
			</DocsOverview>

			<DocsSection id="features" title="Features">
				<p>
					It is a headless, accessible, and beautifully polished tour primitive
					for React applications.
				</p>
				<ul className="list-disc pl-5 mt-4 space-y-2 text-muted-foreground">
					<li>Headless design engineered for customizability</li>
					<li>Keyboard navigation & Focus management</li>
					<li>React Composition out of the box</li>
				</ul>
			</DocsSection>
		</DocsFrame>
	);
}
