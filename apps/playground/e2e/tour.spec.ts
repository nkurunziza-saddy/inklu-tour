import { expect, test } from "@playwright/test";

test.describe("Inklu Tour", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders the tour and navigates between steps", async ({ page }) => {
		await page.getByTestId("start-tour").click();

		const card = page.getByRole("dialog");
		await expect(card).toBeVisible();
		await expect(card).toHaveAccessibleName("First Target");
		await expect(card).toHaveAccessibleDescription("This is the first target.");
		await expect(page.locator(".inklu-tour-step-counter")).toHaveText("1 of 2");

		await expect(page).toHaveScreenshot("step-1.png", {
			mask: [page.locator(".inklu-tour-card")],
		});

		await page.getByRole("button", { name: "Next" }).click();
		await expect(card).toHaveAccessibleName("Second Target");

		await expect(page).toHaveScreenshot("step-2.png", {
			mask: [page.locator(".inklu-tour-card")],
		});

		await page.getByRole("button", { name: "Close tour" }).click();
		await expect(card).toBeHidden();
	});

	test("shows Finish on the last step and completes the tour", async ({
		page,
	}) => {
		await page.getByTestId("start-tour").click();
		await page.getByRole("button", { name: "Next" }).click();

		const finish = page.getByRole("button", { name: "Finish" });
		await expect(finish).toBeVisible();
		await finish.click();

		await expect(page.getByRole("dialog")).toBeHidden();
	});

	test("disables Prev on the first step", async ({ page }) => {
		await page.getByTestId("start-tour").click();
		await expect(page.getByRole("button", { name: "Prev" })).toBeDisabled();

		await page.getByRole("button", { name: "Next" }).click();
		await expect(page.getByRole("button", { name: "Prev" })).toBeEnabled();
	});

	test("supports keyboard navigation", async ({ page }) => {
		await page.getByTestId("start-tour").click();

		const card = page.getByRole("dialog");
		await expect(card).toHaveAccessibleName("First Target");

		await page.keyboard.press("ArrowRight");
		await expect(card).toHaveAccessibleName("Second Target");

		await page.keyboard.press("ArrowLeft");
		await expect(card).toHaveAccessibleName("First Target");
	});

	test("moves focus to the card and announces the step", async ({ page }) => {
		await page.getByTestId("start-tour").click();

		await expect(page.getByRole("dialog")).toBeFocused();
		await expect(page.getByRole("status")).toHaveText("First Target, 1 of 2");
	});

	test("leaves arrow keys to the page when typing in an input", async ({
		page,
	}) => {
		await page.getByTestId("start-tour").click();
		const card = page.getByRole("dialog");
		await expect(card).toHaveAccessibleName("First Target");

		// A global ArrowRight handler would make text fields unusable during a tour.
		await page.evaluate(() => {
			const input = document.createElement("input");
			input.id = "probe";
			input.value = "abc";
			document.body.appendChild(input);
			input.focus();
			input.setSelectionRange(0, 0);
		});

		await page.keyboard.press("ArrowRight");
		await expect(card).toHaveAccessibleName("First Target");
		expect(
			await page.evaluate(
				() =>
					(document.getElementById("probe") as HTMLInputElement).selectionStart,
			),
		).toBe(1);
	});

	test("dismisses on Escape", async ({ page }) => {
		await page.getByTestId("start-tour").click();
		await expect(page.getByRole("dialog")).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(page.getByRole("dialog")).toBeHidden();
	});

	test("dismisses when the overlay is clicked", async ({ page }) => {
		// The playground enables closeOnOverlayClick.
		await page.getByTestId("start-tour").click();
		await expect(page.getByRole("dialog")).toBeVisible();

		await page.mouse.click(10, 10);
		await expect(page.getByRole("dialog")).toBeHidden();
	});

	test("skips missing targets when the strategy is skip", async ({ page }) => {
		await page.getByTestId("start-skip-demo").click();

		const card = page.getByRole("dialog");
		await expect(card).toHaveAccessibleName("First");

		// The middle step's target never appears, so it should be skipped.
		await page.getByRole("button", { name: "Next" }).click();
		await expect(card).toHaveAccessibleName("Second");
	});

	test("keeps the spotlight cutout aligned with the target", async ({
		page,
	}) => {
		await page.getByTestId("start-tour").click();
		await expect(page.getByRole("dialog")).toBeVisible();

		const target = await page.locator("#target-1").boundingBox();
		const cutout = await page
			.locator("mask rect")
			.nth(1)
			.evaluate((el) => ({
				width: Number(el.getAttribute("width")),
				height: Number(el.getAttribute("height")),
			}));

		// Default spotlightPadding is 8 on each side.
		expect(cutout.width).toBeCloseTo((target?.width ?? 0) + 16, 0);
		expect(cutout.height).toBeCloseTo((target?.height ?? 0) + 16, 0);
	});
});
