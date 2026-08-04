import { defineConfig, type Options } from "tsup";

const shared = {
	format: ["cjs", "esm"],
	dts: true,
	sourcemap: true,
	// `treeshake` deliberately left off: it routes the output through rollup,
	// which drops the "use client" banner below ("Module level directives cause
	// errors when bundled ... was ignored"). Consumers still tree-shake this
	// package via `sideEffects: false` plus the ESM build.
	target: "es2020",
	external: ["react", "react-dom", "react/jsx-runtime", "@inklu/audio"],
} satisfies Options;

/**
 * Two builds rather than one, because the `"use client"` banner has to land on
 * the React entry and must NOT land on the framework-agnostic core entry.
 * esbuild strips source-level directives when it bundles, so a banner is the
 * only way to get them into the output — and `banner` is per-build, not
 * per-entry. A shared chunk between the two would poison the core entry, so
 * each build is kept self-contained.
 */
export default defineConfig([
	{
		...shared,
		entry: { index: "src/index.ts" },
		clean: true,
	},
	{
		...shared,
		entry: { react: "src/react/index.ts" },
		clean: false,
		banner: { js: '"use client";' },
	},
]);
