import { DocsCode, DocsFrame, DocsHeader, DocsSection } from "@inklu/docs";
import { highlightSnippets } from "@inklu/docs/shiki";

const SNIPPETS = {
	usage: {
		lang: "tsx",
		code: `import { TourTarget } from "@inklu/tour";

export function Sidebar() {
  return (
    <TourTarget name="sidebar">
      <aside className="w-64 bg-secondary p-4">
        <h2>Navigation</h2>
        <ul>
          <li>Home</li>
          <li>Settings</li>
        </ul>
      </aside>
    </TourTarget>
  );
}`,
	},
};

export default async function TourTargetDocsPage() {
	const highlighted = await highlightSnippets(SNIPPETS);

	return (
		<DocsFrame>
			<DocsHeader title="TourTarget" date="Updated July 2026" />

			<DocsSection id="usage" title="Usage">
				<p className="text-muted-foreground mb-4">
					The <code>TourTarget</code> component wraps any DOM element you want
					to highlight during a tour. It registers the element's bounding box
					and ensures the tour's spotlight smoothly moves to it.
				</p>
				<DocsCode code={SNIPPETS.usage.code} html={highlighted.usage} />
			</DocsSection>

			<DocsSection id="how-it-works" title="How it Works">
				<p className="text-muted-foreground">
					Under the hood, <code>TourTarget</code> clones its child element using
					React's <code>cloneElement</code> and attaches a ref. When the tour
					reaches a step whose <code>target</code> matches the <code>name</code>{" "}
					prop of a <code>TourTarget</code>, the system calculates its layout
					and animates the spotlight. It seamlessly handles scrolling into view
					if the target is off-screen.
				</p>
			</DocsSection>
		</DocsFrame>
	);
}
