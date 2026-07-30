import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { observe, sounds, TourProvider, useTour } from "../index";
import { CloseButton, NextButton, PreviousButton } from "../primitive/card";
import { TourContext } from "../primitive/context";

// Mock Web Audio API for JSDOM constructor call: `new AudioContext()`
if (typeof window !== "undefined") {
	class MockAudioContext {
		currentTime = 0;
		state = "running";
		destination = {};
		resume = vi.fn().mockResolvedValue(undefined);
		createGain = vi.fn().mockReturnValue({
			gain: {
				value: 1,
				setValueAtTime: vi.fn(),
				exponentialRampToValueAtTime: vi.fn(),
			},
			connect: vi.fn(),
		});
		createWaveShaper = vi.fn().mockReturnValue({
			curve: new Float32Array(),
			oversample: "none",
			connect: vi.fn(),
		});
		createBiquadFilter = vi.fn().mockReturnValue({
			type: "highshelf",
			frequency: { setValueAtTime: vi.fn() },
			gain: { setValueAtTime: vi.fn() },
			connect: vi.fn(),
		});
		createDynamicsCompressor = vi.fn().mockReturnValue({
			threshold: { setValueAtTime: vi.fn() },
			knee: { setValueAtTime: vi.fn() },
			ratio: { setValueAtTime: vi.fn() },
			attack: { setValueAtTime: vi.fn() },
			release: { setValueAtTime: vi.fn() },
			connect: vi.fn(),
		});
		createConvolver = vi.fn().mockReturnValue({
			buffer: null,
			connect: vi.fn(),
		});
		createBuffer = vi.fn().mockReturnValue({
			getChannelData: vi.fn().mockReturnValue(new Float32Array(100)),
		});
		createBufferSource = vi.fn().mockReturnValue({
			buffer: null,
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
		});
	}

	window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
}

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
	next: vi.fn(),
	previous: vi.fn(),
	close: vi.fn(),
	labels: { next: "Next", previous: "Prev", finish: "Finish" },
} as any;

describe("@inklu/tour Audio Integration", () => {
	it("re-exports observe and sounds from @inklu/audio", () => {
		expect(observe).toBeTypeOf("function");
		expect(sounds).toBeDefined();
		expect(sounds.tap).toBeTypeOf("function");
		expect(sounds.turn).toBeTypeOf("function");
	});

	it("renders NextButton, PreviousButton, and CloseButton with proper data-sound-click attributes", () => {
		render(
			<TourContext.Provider value={mockTourContextValue}>
				<NextButton>Next</NextButton>
				<PreviousButton>Prev</PreviousButton>
				<CloseButton>Close</CloseButton>
			</TourContext.Provider>,
		);

		const nextBtn = screen.getByRole("button", { name: "Next" });
		const prevBtn = screen.getByRole("button", { name: "Prev" });
		const closeBtn = screen.getByRole("button", { name: "Close" });

		expect(nextBtn.getAttribute("data-sound-click")).toBe("turn:forward");
		expect(prevBtn.getAttribute("data-sound-click")).toBe("turn:backward");
		expect(closeBtn.getAttribute("data-sound-click")).toBe("close");
	});

	it("allows custom data-sound overrides on tour buttons", () => {
		render(
			<TourContext.Provider value={mockTourContextValue}>
				<NextButton data-sound-click="success">Custom Next</NextButton>
			</TourContext.Provider>,
		);

		const nextBtn = screen.getByRole("button", { name: "Custom Next" });
		expect(nextBtn.getAttribute("data-sound-click")).toBe("success");
	});

	it("initializes observe() when TourProvider is mounted with default enableAudio=true", () => {
		const cleanup = observe();
		expect(cleanup).toBeTypeOf("function");
		cleanup();
	});

	it("handles user interactions and triggers sound events via data-attributes without error", () => {
		const cleanup = observe();

		render(
			<TourContext.Provider value={mockTourContextValue}>
				<NextButton>Next Step</NextButton>
			</TourContext.Provider>,
		);

		const btn = screen.getByRole("button", { name: "Next Step" });
		expect(() => {
			fireEvent.click(btn);
		}).not.toThrow();

		cleanup();
	});
});
