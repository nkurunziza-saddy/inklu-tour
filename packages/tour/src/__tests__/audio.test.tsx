import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloseButton, NextButton, PreviousButton } from "../react/card";
import { TourProvider } from "../react/composed";
import { TourContext } from "../react/context";

const observeCleanup = vi.fn();
const observe = vi.fn(() => observeCleanup);

vi.mock("@inklu/audio", () => ({
	observe,
	sounds: { tap: vi.fn(), turn: vi.fn() },
}));

const mockTourContextValue = {
	tour: null,
	open: true,
	rectsStepId: null,
	setStep: vi.fn(),
	rects: [],
	currentStep: { id: "step-1", target: "#target-1", meta: { title: "Step 1" } },
	currentStepIndex: 0,
	totalSteps: 2,
	isWaiting: false,
	skipAnimation: true,
	isAnimatingExit: false,
	reducedMotion: false,
	config: {},
	labelId: "label",
	descriptionId: "description",
	container: null,
	next: vi.fn(),
	previous: vi.fn(),
	close: vi.fn(),
} as never;

// Cleared before rather than after each test: the global cleanup hook that
// unmounts leftover trees runs after this file's hooks, so clearing afterwards
// would let that unmount's teardown call bleed into the next test's counts.
beforeEach(() => {
	vi.clearAllMocks();
});

describe("@inklu/tour audio integration", () => {
	it("does not load @inklu/audio unless enableAudio is set", async () => {
		render(
			<TourProvider tours={[]}>
				<div>app</div>
			</TourProvider>,
		);

		// Give the dynamic import a chance to resolve before asserting it didn't run.
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(observe).not.toHaveBeenCalled();
	});

	it("lazily loads and starts the audio observer when enableAudio is set", async () => {
		render(
			<TourProvider tours={[]} enableAudio>
				<div>app</div>
			</TourProvider>,
		);

		await waitFor(() => expect(observe).toHaveBeenCalledTimes(1));
	});

	it("tears the audio observer down on unmount", async () => {
		const { unmount } = render(
			<TourProvider tours={[]} enableAudio>
				<div>app</div>
			</TourProvider>,
		);

		await waitFor(() => expect(observe).toHaveBeenCalledTimes(1));
		unmount();
		expect(observeCleanup).toHaveBeenCalledTimes(1);
	});

	it("renders navigation buttons with the data-sound-click hooks", () => {
		render(
			<TourContext.Provider value={mockTourContextValue}>
				<NextButton>Next</NextButton>
				<PreviousButton>Prev</PreviousButton>
				<CloseButton>Close</CloseButton>
			</TourContext.Provider>,
		);

		expect(
			screen
				.getByRole("button", { name: "Next" })
				.getAttribute("data-sound-click"),
		).toBe("turn:forward");
		expect(
			screen
				.getByRole("button", { name: "Prev" })
				.getAttribute("data-sound-click"),
		).toBe("turn:backward");
		expect(
			screen
				.getByRole("button", { name: "Close" })
				.getAttribute("data-sound-click"),
		).toBe("close");
	});

	it("allows custom data-sound overrides on tour buttons", () => {
		render(
			<TourContext.Provider value={mockTourContextValue}>
				<NextButton data-sound-click="success">Custom Next</NextButton>
			</TourContext.Provider>,
		);

		expect(
			screen
				.getByRole("button", { name: "Custom Next" })
				.getAttribute("data-sound-click"),
		).toBe("success");
	});
});
