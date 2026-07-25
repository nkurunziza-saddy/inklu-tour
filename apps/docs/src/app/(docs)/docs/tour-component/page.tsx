import { DocsCode, DocsFrame, DocsHeader, DocsSection } from "@inklu/docs";
import { highlightSnippets } from "@inklu/docs/shiki";

const SNIPPETS = {
	usage: {
		lang: "tsx",
		code: `import { Tour } from "@inklu/tour";

export default function App() {
  return (
    <Tour
      tourId="onboarding"
      steps={[
        { id: "step-1", target: "header", meta: { title: "Welcome", content: "This is the header." } },
        { id: "step-2", target: "sidebar", meta: { title: "Navigation", content: "Use this to navigate." } }
      ]}
      onComplete={() => console.log("Tour completed!")}
    />
  );
}`,
	},
};

export default async function TourComponentDocsPage() {
	const highlighted = await highlightSnippets(SNIPPETS);

	return (
		<DocsFrame>
			<DocsHeader title="Tour" date="Updated July 2026" />

			<DocsSection id="usage" title="Usage">
				<p className="text-muted-foreground mb-4">
					The <code>Tour</code> component is the root coordinator of the
					onboarding experience. It handles state, stepping logic, and rendering
					the spotlight and tour card.
				</p>
				<DocsCode code={SNIPPETS.usage.code} html={highlighted.usage} />
			</DocsSection>

			<DocsSection id="props" title="Props">
				<div className="prose dark:prose-invert max-w-none">
					<table className="w-full text-left text-sm">
						<thead>
							<tr>
								<th className="pb-2 font-medium">Prop</th>
								<th className="pb-2 font-medium">Type</th>
								<th className="pb-2 font-medium">Description</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/50 text-muted-foreground">
							<tr>
								<td className="py-2 text-foreground font-mono">tourId</td>
								<td className="py-2 font-mono text-xs">string</td>
								<td className="py-2">
									Unique identifier for this tour, used to target it via the{" "}
									<code>useTour</code> hook.
								</td>
							</tr>
							<tr>
								<td className="py-2 text-foreground font-mono">steps</td>
								<td className="py-2 font-mono text-xs">TourStep[]</td>
								<td className="py-2">
									Array of step definitions. Each step must have an{" "}
									<code>id</code> and a <code>target</code> string that matches
									a <code>TourTarget</code> component.
								</td>
							</tr>
							<tr>
								<td className="py-2 text-foreground font-mono">onComplete</td>
								<td className="py-2 font-mono text-xs">() =&gt; void</td>
								<td className="py-2">
									Callback fired when the user finishes the last step.
								</td>
							</tr>
							<tr>
								<td className="py-2 text-foreground font-mono">onSkip</td>
								<td className="py-2 font-mono text-xs">() =&gt; void</td>
								<td className="py-2">
									Callback fired when the user closes the tour prematurely.
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</DocsSection>
		</DocsFrame>
	);
}
