import {
	DocsFrame,
	DocsHeader,
	DocsInstallation,
	DocsSection,
} from "@inklu/docs";

export default function InstallationDocsPage() {
	return (
		<DocsFrame>
			<DocsHeader title="Installation" date="Updated July 2026" />

			<DocsSection id="installing-package" title="Package Installation">
				<p className="text-muted-foreground mb-4">
					Install via your favorite package manager.
				</p>
				<DocsInstallation
					install={[
						{ id: "npm", command: "npm install @inklu/tour" },
						{ id: "pnpm", command: "pnpm add @inklu/tour" },
						{ id: "yarn", command: "yarn add @inklu/tour" },
						{ id: "bun", command: "bun add @inklu/tour" },
					]}
				/>
			</DocsSection>
		</DocsFrame>
	);
}
