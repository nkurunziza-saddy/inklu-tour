import { DocsCode, DocsFrame, DocsHeader, DocsSection } from "@inklu/docs";
import { highlightSnippets } from "@inklu/docs/shiki";

const SNIPPETS = {
	useTour: {
		lang: "tsx",
		code: `import { useTour } from "@inklu/tour";

export function StartTourButton() {
  const { startTour, stopTour, isActive } = useTour();

  return (
    <button onClick={() => startTour("demo-tour")}>
      Start Tour
    </button>
  );
}`,
	},
};

export default async function UseTourDocsPage() {
	const highlighted = await highlightSnippets(SNIPPETS);

	return (
		<DocsFrame>
			<DocsHeader title="useTour Hook" date="Updated July 2026" />

			<DocsSection id="usage" title="Usage">
				<p className="text-muted-foreground mb-4">
					Control your tours programmatically from any child component using the{" "}
					<code>useTour</code> hook.
				</p>
				<DocsCode code={SNIPPETS.useTour.code} html={highlighted.useTour} />
			</DocsSection>
		</DocsFrame>
	);
}
