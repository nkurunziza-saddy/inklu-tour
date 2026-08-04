import { defineConfig, devices } from "@playwright/test";

/**
 * Overridable so a stray dev server on the default port can't hijack the run.
 * `reuseExistingServer` trusts whatever answers on the URL, which silently
 * tests the wrong app when the port is already taken.
 */
const PORT = Number(process.env.PLAYGROUND_PORT ?? 5173);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [["github"], ["html"]] : "html",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		// `pnpm run dev -- --port` forwards a literal `--` to vite, which then
		// ignores the port; invoke vite directly instead.
		command: `pnpm exec vite --port ${PORT} --strictPort`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		stdout: "pipe",
	},
});
