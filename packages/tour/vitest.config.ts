import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/__tests__/setup.ts"],
		coverage: {
			provider: "v8",
			include: ["src/core/**/*.ts"],
			exclude: ["src/core/index.ts", "src/core/types.ts"],
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 80,
				statements: 95,
			},
		},
	},
});
