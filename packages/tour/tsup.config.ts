import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		react: "src/react/index.ts",
		vue: "src/vue/index.ts",
		svelte: "src/svelte/index.ts",
	},
	format: ["cjs", "esm", "iife"],
	globalName: "InkluTour",
	dts: true,
	clean: true,
	external: ["react", "react-dom", "vue", "svelte"],
});
