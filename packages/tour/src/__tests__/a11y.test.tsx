import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tour } from "../react/composed/tour";
import type { TourConfig, TourConfigOptions } from "../react/index";

const tour: TourConfig = {
	id: "t",
	steps: [
		{ id: "s1", target: "#one", meta: { title: "First", content: "One body" } },
		{
			id: "s2",
			target: "#two",
			meta: { title: "Second", content: "Two body" },
		},
	],
};

function setupTargets() {
	document.body.innerHTML = `<div id="one"></div><div id="two"></div>`;
	for (const id of ["one", "two"]) {
		const el = document.getElementById(id) as HTMLElement;
		el.getBoundingClientRect = () =>
			({
				top: 10,
				left: 10,
				width: 100,
				height: 100,
				bottom: 110,
				right: 110,
			}) as DOMRect;
		el.scrollIntoView = vi.fn();
	}
}

function Harness({
	config,
	onStepChange,
	onDismiss,
	initialStep = 0,
}: {
	config?: TourConfigOptions;
	onStepChange?: (i: number) => void;
	onDismiss?: () => void;
	initialStep?: number;
}) {
	const [step, setStep] = React.useState(initialStep);
	const [open, setOpen] = React.useState(true);
	return (
		<Tour
			tour={tour}
			open={open}
			onOpenChange={setOpen}
			stepIndex={step}
			onStepChange={(i) => {
				setStep(i);
				onStepChange?.(i);
			}}
			onDismiss={onDismiss}
			config={config}
		/>
	);
}

// jsdom's real getComputedStyle is used here on purpose: the accessible-name
// computation needs a genuine CSSStyleDeclaration, not a plain-object stub.
beforeEach(() => {
	setupTargets();
});

describe("tour card accessibility", () => {
	it("exposes the card as a dialog named and described by the step", async () => {
		render(<Harness />);

		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveAccessibleName("First");
		expect(dialog).toHaveAccessibleDescription("One body");
	});

	it("is not aria-modal unless focus is actually trapped", async () => {
		const { unmount } = render(<Harness />);
		expect((await screen.findByRole("dialog")).hasAttribute("aria-modal")).toBe(
			false,
		);
		unmount();

		render(<Harness config={{ trapFocus: true }} />);
		expect((await screen.findByRole("dialog")).getAttribute("aria-modal")).toBe(
			"true",
		);
	});

	it("announces the active step in a live region", async () => {
		render(<Harness />);
		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent("First, 1 of 2"),
		);
	});

	it("moves focus to the card on open and restores it on close", async () => {
		document.body.insertAdjacentHTML(
			"beforeend",
			`<button id="opener">open</button>`,
		);
		const opener = document.getElementById("opener") as HTMLButtonElement;
		opener.focus();
		expect(document.activeElement).toBe(opener);

		const { unmount } = render(<Harness />);
		const dialog = await screen.findByRole("dialog");
		await waitFor(() => expect(document.activeElement).toBe(dialog));

		unmount();
		expect(document.activeElement).toBe(opener);
	});
});

describe("tour keyboard navigation", () => {
	it("advances and rewinds with the arrow keys", async () => {
		const onStepChange = vi.fn();
		render(<Harness onStepChange={onStepChange} />);
		await screen.findByRole("dialog");

		fireEvent.keyDown(window, { key: "ArrowRight" });
		expect(onStepChange).toHaveBeenLastCalledWith(1);

		fireEvent.keyDown(window, { key: "ArrowLeft" });
		expect(onStepChange).toHaveBeenLastCalledWith(0);
	});

	it("leaves arrow keys alone while the user is typing", async () => {
		const onStepChange = vi.fn();
		render(<Harness onStepChange={onStepChange} />);
		await screen.findByRole("dialog");

		document.body.insertAdjacentHTML("beforeend", `<input id="field" />`);
		const input = document.getElementById("field") as HTMLInputElement;

		fireEvent.keyDown(input, { key: "ArrowRight", bubbles: true });
		fireEvent.keyDown(input, { key: "ArrowLeft", bubbles: true });
		expect(onStepChange).not.toHaveBeenCalled();

		document.body.insertAdjacentHTML(
			"beforeend",
			`<div id="editor" contenteditable="true"></div>`,
		);
		const editor = document.getElementById("editor") as HTMLElement;
		// jsdom doesn't derive isContentEditable from the attribute.
		Object.defineProperty(editor, "isContentEditable", { value: true });
		fireEvent.keyDown(editor, { key: "ArrowRight", bubbles: true });
		expect(onStepChange).not.toHaveBeenCalled();
	});

	it("ignores arrow keys pressed with a modifier or already handled", async () => {
		const onStepChange = vi.fn();
		render(<Harness onStepChange={onStepChange} />);
		await screen.findByRole("dialog");

		fireEvent.keyDown(window, { key: "ArrowRight", metaKey: true });
		fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true });
		fireEvent.keyDown(window, { key: "ArrowRight", altKey: true });
		expect(onStepChange).not.toHaveBeenCalled();
	});

	it("respects keyboardNavigation: false but still honours Escape", async () => {
		const onStepChange = vi.fn();
		const onDismiss = vi.fn();
		render(
			<Harness
				config={{ keyboardNavigation: false }}
				onStepChange={onStepChange}
				onDismiss={onDismiss}
			/>,
		);
		await screen.findByRole("dialog");

		fireEvent.keyDown(window, { key: "ArrowRight" });
		expect(onStepChange).not.toHaveBeenCalled();

		fireEvent.keyDown(window, { key: "Escape" });
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it("does not dismiss on Escape when dismissOnEscape is false", async () => {
		const onDismiss = vi.fn();
		render(
			<Harness config={{ dismissOnEscape: false }} onDismiss={onDismiss} />,
		);
		await screen.findByRole("dialog");

		fireEvent.keyDown(window, { key: "Escape" });
		expect(onDismiss).not.toHaveBeenCalled();
	});
});

describe("tour spotlight", () => {
	it("scopes the mask id per instance so two spotlights cannot collide", async () => {
		render(
			<>
				<Harness />
				<Harness />
			</>,
		);
		await waitFor(() =>
			expect(document.querySelectorAll("mask").length).toBe(2),
		);

		const ids = [...document.querySelectorAll("mask")].map((m) => m.id);
		expect(ids[0]).not.toBe(ids[1]);
		expect(new Set(ids).size).toBe(2);
	});

	it("hides the overlay from assistive tech", async () => {
		render(<Harness />);
		await waitFor(() => {
			const svg = document.querySelector("svg[aria-hidden='true']");
			expect(svg).not.toBeNull();
		});
	});
});
