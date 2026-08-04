import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type Placement,
	TourArrow,
	TourCard,
	TourCloseButton,
	type TourConfig,
	type TourConfigOptions,
	TourNextButton,
	TourPreviousButton,
	TourProvider,
	TourRoot,
	TourSettingsMorph,
	useTour,
	useTourContext,
} from "../react/index";

// Centred in the 1024x768 test viewport so every placement has room for the
// card and none of them get flipped to the opposite side.
function sizeTarget(id: string) {
	const el = document.createElement("div");
	el.id = id;
	el.getBoundingClientRect = () =>
		({
			top: 330,
			left: 460,
			width: 100,
			height: 100,
			bottom: 430,
			right: 560,
		}) as DOMRect;
	el.scrollIntoView = vi.fn();
	document.body.appendChild(el);
	return el;
}

function makeTour(placement?: Placement): TourConfig {
	return {
		id: "t",
		steps: [
			{
				id: "s1",
				target: "#one",
				placement,
				meta: { title: "First", content: "Body" },
			},
			{
				id: "s2",
				target: "#one",
				meta: { title: "Second", content: "Body 2" },
			},
		],
	};
}

function Harness({
	config,
	placement,
	children,
	onDismiss,
}: {
	config?: TourConfigOptions;
	placement?: Placement;
	children?: React.ReactNode;
	onDismiss?: () => void;
}) {
	const [step, setStep] = React.useState(0);
	const [open, setOpen] = React.useState(true);
	return (
		<TourRoot
			tour={makeTour(placement)}
			open={open}
			onOpenChange={setOpen}
			stepIndex={step}
			onStepChange={setStep}
			onDismiss={onDismiss}
			config={config}
		>
			<TourCard data-testid="card">
				<TourArrow data-testid="arrow" />
				{children ?? <Body />}
			</TourCard>
		</TourRoot>
	);
}

function Body() {
	const { currentStep, labelId, descriptionId } = useTourContext();
	return (
		<>
			<h2 id={labelId}>{currentStep?.meta?.title}</h2>
			<p id={descriptionId}>{currentStep?.meta?.content}</p>
			<TourPreviousButton>Prev</TourPreviousButton>
			<TourNextButton>Next</TourNextButton>
			<TourCloseButton>Close</TourCloseButton>
		</>
	);
}

beforeEach(() => {
	sizeTarget("one");
});

describe("TourCard positioning", () => {
	it.each([
		["bottom", "bottom"],
		["top", "top"],
		["left", "left"],
		["right", "right"],
	] as const)(
		"reflects the %s side on the card",
		async (placement, expected) => {
			render(<Harness placement={placement} />);
			const card = await screen.findByTestId("card");
			await waitFor(() => expect(card).toHaveAttribute("data-side", expected));
		},
	);

	it("renders the arrow only while a target is resolved", async () => {
		render(<Harness placement="bottom" />);
		const arrow = await screen.findByTestId("arrow");
		await waitFor(() => expect(arrow).not.toHaveStyle({ display: "none" }));
		expect(arrow).toHaveAttribute("aria-hidden", "true");
	});

	it("hides the arrow when showArrow is off", async () => {
		render(<Harness config={{ showArrow: false }} />);
		const arrow = await screen.findByTestId("arrow");
		expect(arrow).toHaveStyle({ display: "none" });
	});

	it("honours a custom zIndex for the card and spotlight", async () => {
		render(<Harness config={{ zIndex: 500 }} />);
		const card = await screen.findByTestId("card");
		// Card sits one above the spotlight so it is never covered by the mask.
		expect(card).toHaveStyle({ zIndex: "501" });
	});

	it("portals into a custom container when one is given", async () => {
		const host = document.createElement("div");
		host.id = "host";
		document.body.appendChild(host);

		render(
			<TourRoot tour={makeTour()} open stepIndex={0} container={host}>
				<TourCard data-testid="card">
					<Body />
				</TourCard>
			</TourRoot>,
		);

		const card = await screen.findByTestId("card");
		expect(host.contains(card)).toBe(true);
	});
});

describe("TourCard interaction", () => {
	it("advances, rewinds and closes through the buttons", async () => {
		const onDismiss = vi.fn();
		render(<Harness onDismiss={onDismiss} />);
		await screen.findByTestId("card");

		expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();

		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		await waitFor(() =>
			expect(screen.getByRole("heading")).toHaveTextContent("Second"),
		);

		fireEvent.click(screen.getByRole("button", { name: "Prev" }));
		await waitFor(() =>
			expect(screen.getByRole("heading")).toHaveTextContent("First"),
		);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it("lets a consumer's onClick cancel the built-in behaviour", async () => {
		function CancelBody() {
			return (
				<TourNextButton onClick={(e) => e.preventDefault()}>
					Next
				</TourNextButton>
			);
		}
		render(
			<Harness>
				<CancelBody />
			</Harness>,
		);
		await screen.findByTestId("card");

		fireEvent.click(screen.getByRole("button", { name: "Next" }));
		// Still on the first step because the consumer prevented the default.
		expect(screen.queryByText("Second")).toBeNull();
	});

	it("closes on an outside pointer press when configured", async () => {
		vi.useFakeTimers();
		const onDismiss = vi.fn();
		render(
			<Harness config={{ closeOnOutsideClick: true }} onDismiss={onDismiss} />,
		);

		// The listener is attached on a short delay so the opening click doesn't
		// immediately close the tour.
		await vi.advanceTimersByTimeAsync(100);
		fireEvent.pointerDown(document.body);

		expect(onDismiss).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});

	it("ignores pointer presses inside the card", async () => {
		vi.useFakeTimers();
		const onDismiss = vi.fn();
		render(
			<Harness config={{ closeOnOutsideClick: true }} onDismiss={onDismiss} />,
		);

		await vi.advanceTimersByTimeAsync(100);
		fireEvent.pointerDown(screen.getByRole("button", { name: "Next" }));

		expect(onDismiss).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});

describe("TourCard focus trap", () => {
	it("cycles Tab within the card when trapFocus is on", async () => {
		render(<Harness config={{ trapFocus: true }} />);
		const card = await screen.findByTestId("card");

		const next = screen.getByRole("button", { name: "Next" });
		const close = screen.getByRole("button", { name: "Close" });

		close.focus();
		fireEvent.keyDown(document, { key: "Tab" });
		await waitFor(() => expect(document.activeElement).toBe(next));

		next.focus();
		fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
		await waitFor(() => expect(document.activeElement).toBe(close));

		expect(card).toHaveAttribute("aria-modal", "true");
	});

	it("pulls focus back into the card when it has escaped", async () => {
		render(<Harness config={{ trapFocus: true }} />);
		await screen.findByTestId("card");

		const outside = document.createElement("button");
		document.body.appendChild(outside);
		outside.focus();

		fireEvent.keyDown(document, { key: "Tab" });
		await waitFor(() =>
			expect(document.activeElement).toBe(
				screen.getByRole("button", { name: "Next" }),
			),
		);
	});

	it("leaves Tab alone when trapFocus is off", async () => {
		render(<Harness />);
		await screen.findByTestId("card");

		const outside = document.createElement("button");
		document.body.appendChild(outside);
		outside.focus();

		fireEvent.keyDown(document, { key: "Tab" });
		expect(document.activeElement).toBe(outside);
	});

	it("does not steal focus when autoFocus is off", async () => {
		const outside = document.createElement("button");
		document.body.appendChild(outside);
		outside.focus();

		render(<Harness config={{ autoFocus: false }} />);
		await screen.findByTestId("card");
		await new Promise((r) => requestAnimationFrame(() => r(null)));

		expect(document.activeElement).toBe(outside);
	});
});

describe("TourSettingsMorph", () => {
	function SettingsHarness() {
		return (
			<TourProvider tours={[makeTour()]}>
				<TourSettingsMorph />
				<Readout />
			</TourProvider>
		);
	}

	function Readout() {
		const { config } = useTour();
		return <output data-testid="readout">{JSON.stringify(config)}</output>;
	}

	it("toggles configuration options through the panel", () => {
		render(<SettingsHarness />);

		const trigger = screen.getByRole("button", { name: "Tour Settings Menu" });
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");

		fireEvent.click(screen.getByLabelText("Press outside to close"));
		expect(screen.getByTestId("readout").textContent).toContain(
			'"closeOnOutsideClick":true',
		);

		fireEvent.click(screen.getByLabelText("Show Spotlight"));
		expect(screen.getByTestId("readout").textContent).toContain(
			'"showSpotlight":false',
		);
	});

	it("updates the slider-backed numeric options", () => {
		render(<SettingsHarness />);
		fireEvent.click(screen.getByRole("button", { name: "Tour Settings Menu" }));

		fireEvent.change(screen.getByLabelText(/Spotlight Padding/i), {
			target: { value: "20" },
		});
		expect(screen.getByTestId("readout").textContent).toContain(
			'"spotlightPadding":20',
		);
	});

	it("closes on Escape and on an outside press", () => {
		render(<SettingsHarness />);
		const trigger = screen.getByRole("button", { name: "Tour Settings Menu" });

		fireEvent.click(trigger);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(trigger).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(trigger);
		fireEvent.mouseDown(document.body);
		expect(trigger).toHaveAttribute("aria-expanded", "false");
	});
});
