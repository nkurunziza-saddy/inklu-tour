import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TourEngine } from "../core/machine";

describe("TourEngine", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("initializes with correct default state", () => {
		const engine = new TourEngine();
		const state = engine.getState();
		expect(state.open).toBe(false);
		expect(state.mounted).toBe(false);
		expect(state.stepIndex).toBe(0);
		expect(state.currentStep).toBeNull();
	});

	it("updates state correctly through setProps", () => {
		const engine = new TourEngine();
		const steps = [{ id: "step-1", target: "#foo" }, { id: "step-2" }];

		engine.setProps(true, 0, steps);
		let state = engine.getState();
		expect(state.open).toBe(true);
		expect(state.mounted).toBe(true);
		expect(state.currentStep?.id).toBe("step-1");
		expect(state.isAnimatingExit).toBe(false);

		engine.setProps(true, 1, steps);
		state = engine.getState();
		expect(state.stepIndex).toBe(1);
		expect(state.currentStep?.id).toBe("step-2");
	});

	it("triggers exit animation when closing", () => {
		const engine = new TourEngine();
		const steps = [{ id: "step-1", target: "#foo" }];

		engine.setProps(true, 0, steps);
		expect(engine.getState().mounted).toBe(true);

		// Close the tour
		engine.setProps(false, 0, steps);
		expect(engine.getState().open).toBe(false);
		expect(engine.getState().isAnimatingExit).toBe(true);
		// Still mounted while animating
		expect(engine.getState().mounted).toBe(true);

		// Fast-forward exit duration (150ms)
		vi.advanceTimersByTime(200);

		expect(engine.getState().mounted).toBe(false);
		expect(engine.getState().isAnimatingExit).toBe(false);
	});

	it("calls appropriate callbacks when navigating", () => {
		const engine = new TourEngine();
		const steps = [{ id: "step-1" }, { id: "step-2" }, { id: "step-3" }];

		const onStepChange = vi.fn();
		const onComplete = vi.fn();
		const onOpenChange = vi.fn();
		const onDismiss = vi.fn();

		engine.setOptions({
			onStepChange,
			onComplete,
			onOpenChange,
			onDismiss,
		});

		engine.setProps(true, 0, steps);

		// Go next
		engine.next();
		expect(onStepChange).toHaveBeenCalledWith(1);
		expect(onComplete).not.toHaveBeenCalled();

		// Move to last step manually
		engine.setProps(true, 2, steps);

		// Go next from last step should complete
		engine.next();
		expect(onComplete).toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledWith(false);

		// Go previous
		engine.previous();
		expect(onStepChange).toHaveBeenCalledWith(1);

		// Close
		engine.close();
		expect(onDismiss).toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("handles skip animation toggle", () => {
		const engine = new TourEngine();
		expect(engine.getState().skipAnimation).toBe(false);

		engine.setSkipAnimation(true);
		expect(engine.getState().skipAnimation).toBe(true);
	});

	it("handles next/previous/close with no options set (no-op)", () => {
		const engine = new TourEngine();
		engine.setProps(true, 0, [{ id: "step-1" }, { id: "step-2" }]);
		expect(() => {
			engine.next();
			engine.previous();
			engine.close();
		}).not.toThrow();
	});

	it("notifies listeners on state change", () => {
		const engine = new TourEngine();
		const listener = vi.fn();

		const unsubscribe = engine.subscribe(listener);

		engine.setSkipAnimation(true);
		expect(listener).toHaveBeenCalledTimes(1);

		engine.setProps(true, 0, []);
		expect(listener).toHaveBeenCalledTimes(2);

		unsubscribe();
		engine.setSkipAnimation(false);
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("cleans up on destroy", () => {
		const engine = new TourEngine();
		const steps = [{ id: "step-1" }];
		engine.setProps(true, 0, steps);

		// Set exit timeout
		engine.setProps(false, 0, steps);
		expect(engine.getState().isAnimatingExit).toBe(true);

		engine.destroy();

		// Fast-forward should not crash or trigger anything since it's destroyed
		vi.advanceTimersByTime(200);
		// the state wasn't updated because exitTimeoutId was cleared
		expect(engine.getState().isAnimatingExit).toBe(true);
	});

	it("throws error if target strategy is error and times out", () => {
		const engine = new TourEngine();
		const steps = [
			{
				id: "step-1",
				target: { selector: "#never", strategy: "error" as const, timeout: 50 },
			},
		];
		engine.setProps(true, 0, steps);

		expect(() => {
			vi.advanceTimersByTime(100);
		}).toThrowError("Tour target timeout: #never");
	});

	it("calls onSkip if target strategy is skip and times out", () => {
		const engine = new TourEngine();
		const steps = [
			{
				id: "step-1",
				target: { selector: "#never", strategy: "skip" as const, timeout: 50 },
			},
		];
		const onSkip = vi.fn();
		engine.setOptions({ onSkip });
		engine.setProps(true, 0, steps);

		vi.advanceTimersByTime(100);
		expect(onSkip).toHaveBeenCalledTimes(1);
	});

	it("calls onTargetFound and onTargetWaiting when targets resolve", () => {
		// Add a DOM element
		const el = document.createElement("div");
		el.id = "real-target";
		// Mock rect and visibility
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});
		el.getBoundingClientRect = () =>
			({
				top: 10,
				left: 10,
				width: 100,
				height: 100,
				bottom: 110,
				right: 110,
			}) as any;
		document.body.appendChild(el);

		const onTargetFound = vi.fn();
		const onTargetWaiting = vi.fn();

		const engine = new TourEngine();
		engine.setOptions({ onTargetFound, onTargetWaiting });

		// First step targets the real element
		engine.setProps(true, 0, [{ id: "step-1", target: "#real-target" }]);

		// It should immediately find it
		expect(onTargetFound).toHaveBeenCalledWith("step-1");
		expect(engine.getState().rects.length).toBeGreaterThan(0);
		expect(engine.getState().rectsStepId).toBe("step-1");

		// Next step targets missing element
		engine.setProps(true, 1, [
			{ id: "step-1", target: "#real-target" },
			{ id: "step-2", target: "#missing" },
		]);

		expect(onTargetWaiting).toHaveBeenCalledWith("step-2");
		expect(engine.getState().isWaiting).toBe(true);

		document.body.removeChild(el);
	});
});
