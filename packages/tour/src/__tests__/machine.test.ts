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

	it("stays usable after destroy so StrictMode remounts still work", () => {
		const engine = new TourEngine();
		const steps = [{ id: "step-1" }];

		// React StrictMode runs mount -> cleanup -> mount while `useState` holds on
		// to this same instance. A permanently dead engine would leave every
		// development build's tour inert.
		engine.destroy();
		engine.setProps(true, 0, steps);

		expect(engine.getState().open).toBe(true);
		expect(engine.getState().mounted).toBe(true);
		expect(engine.getState().currentStep?.id).toBe("step-1");
	});

	it("re-notifies subscribers registered after a destroy", () => {
		const engine = new TourEngine();
		engine.destroy();

		const listener = vi.fn();
		engine.subscribe(listener);
		engine.setProps(true, 0, [{ id: "step-1" }]);

		expect(listener).toHaveBeenCalled();
	});

	it("reports via onError instead of throwing when strategy is error", () => {
		const engine = new TourEngine();
		const steps = [
			{
				id: "step-1",
				target: { selector: "#never", strategy: "error" as const, timeout: 50 },
			},
		];
		const onError = vi.fn();
		engine.setOptions({ onError });
		engine.setProps(true, 0, steps);

		// Throwing here would escape into a timer callback where nothing can
		// catch it and would take down the host app.
		expect(() => vi.advanceTimersByTime(100)).not.toThrow();
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(onError.mock.calls[0][0].message).toBe(
			"Tour target timeout: #never",
		);
	});

	it("logs the error when strategy is error and no onError handler is set", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		const engine = new TourEngine();
		engine.setProps(true, 0, [
			{
				id: "step-1",
				target: { selector: "#never", strategy: "error" as const, timeout: 50 },
			},
		]);

		expect(() => vi.advanceTimersByTime(100)).not.toThrow();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
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

	it("does not retrack when only the steps array identity changes", () => {
		const el = document.createElement("div");
		el.id = "stable-target";
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
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
			}) as DOMRect;
		el.scrollIntoView = vi.fn();
		document.body.appendChild(el);

		const onTargetFound = vi.fn();
		const engine = new TourEngine();
		engine.setOptions({ onTargetFound });

		engine.setProps(true, 0, [{ id: "s1", target: "#stable-target" }]);
		expect(onTargetFound).toHaveBeenCalledTimes(1);

		// A consumer rendering `tours={[...]}` inline hands us a brand new array
		// (and new step objects) on every parent render. That must not restart the
		// tracker, because restarting clears the rects, flashes the waiting state
		// and re-runs scrollIntoView, yanking the page on every re-render.
		for (let i = 0; i < 3; i++) {
			engine.setProps(true, 0, [{ id: "s1", target: "#stable-target" }]);
		}

		expect(onTargetFound).toHaveBeenCalledTimes(1);
		expect(el.scrollIntoView).not.toHaveBeenCalled();
		expect(engine.getState().rects.length).toBe(1);

		document.body.removeChild(el);
	});

	it("retracks when the step's target actually changes", () => {
		const engine = new TourEngine();
		const onTargetWaiting = vi.fn();
		engine.setOptions({ onTargetWaiting });

		engine.setProps(true, 0, [{ id: "s1", target: "#a" }]);
		expect(onTargetWaiting).toHaveBeenCalledTimes(1);

		engine.setProps(true, 0, [{ id: "s1", target: "#b" }]);
		expect(onTargetWaiting).toHaveBeenCalledTimes(2);
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
			}) as DOMRect;
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
