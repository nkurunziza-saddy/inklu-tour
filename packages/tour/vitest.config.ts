import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/__tests__/setup.ts"],
		coverage: {
			provider: "v8",
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/__tests__/**",
				// Re-export barrels and type-only modules have nothing to execute.
				"src/**/index.ts",
				"src/core/types.ts",
				"src/react/types.ts",
			],
			// Per-directory rather than one global number: the framework-agnostic
			// core is fully exercisable and held to a high bar, while the React
			// layer's remaining gaps are mostly branches that need real layout.
			thresholds: {
				"src/core/**": {
					lines: 100,
					functions: 100,
					branches: 85,
					statements: 95,
				},
				"src/react/**": {
					lines: 88,
					functions: 80,
					branches: 74,
					statements: 88,
				},
			},
		},
	},
});
