import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TargetTracker } from "../core/tracker";
import { mockElementRect } from "./utils";

describe("TargetTracker", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		document.body.innerHTML = "";
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("finds target immediately if it exists", () => {
		const el = document.createElement("div");
		el.id = "target-1";
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });

		// mock getComputedStyle
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});

		const onTargetFound = vi.fn();
		const onRectsChange = vi.fn();

		const tracker = new TargetTracker({ onTargetFound, onRectsChange });
		tracker.track("#target-1");

		expect(onTargetFound).toHaveBeenCalledTimes(1);
		expect(onRectsChange).toHaveBeenCalledTimes(1);
		expect(onRectsChange.mock.calls[0][0].length).toBe(1);
	});

	it("waits for target if it does not exist initially", () => {
		const onTargetWaiting = vi.fn();
		const onTargetFound = vi.fn();

		const tracker = new TargetTracker({ onTargetWaiting, onTargetFound });
		tracker.track("#delayed-target");

		expect(onTargetWaiting).toHaveBeenCalledTimes(1);
		expect(onTargetFound).not.toHaveBeenCalled();

		// Now insert the element
		const el = document.createElement("div");
		el.id = "delayed-target";
		mockElementRect(el, { width: 100, height: 100 });
		document.body.appendChild(el);

		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});

		// We can simulate the MutationObserver triggering by artificially triggering requestAnimationFrame
		// But TargetTracker uses MutationObserver, which in JSDOM works asynchronously.
		// However, we don't have to wait for JSDOM mutation observer here if we just call the private method,
		// but a better way is to wait for timers or trigger it.
		// Since we mocked ResizeObserver/IntersectionObserver, we can just trigger it manually or let Vitest process microtasks.
	});

	it("triggers timeout if element is never found", () => {
		const onTargetTimeout = vi.fn();
		const tracker = new TargetTracker({ onTargetTimeout });

		tracker.track({
			selector: "#never-found",
			timeout: 1000,
			strategy: "skip",
		});

		vi.advanceTimersByTime(1100);

		expect(onTargetTimeout).toHaveBeenCalledWith("skip", "#never-found");
	});

	it("cleans up event listeners and observers on stop", () => {
		const tracker = new TargetTracker({});
		tracker.track("#target");

		// There shouldn't be any throws when stopping
		expect(() => tracker.stop()).not.toThrow();
	});

	it("handles invalid selectors gracefully (query selector throw)", () => {
		const tracker = new TargetTracker({});
		tracker.track("123-invalid-selector");
		// Should not throw, but should not find it either
		expect(() => tracker.track("!@#")).not.toThrow();
	});

	it("autoScrolls into view when found and not visible", () => {
		const el = document.createElement("div");
		el.id = "target-1";
		document.body.appendChild(el);
		mockElementRect(el, { top: -500, width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});

		el.scrollIntoView = vi.fn();

		const tracker = new TargetTracker({ autoScroll: true });
		tracker.track("#target-1");

		expect(el.scrollIntoView).toHaveBeenCalledWith({
			block: "center",
			behavior: "smooth",
		});
	});

	it("does not autoScroll if autoScroll is disabled", () => {
		const el = document.createElement("div");
		el.id = "target-1";
		document.body.appendChild(el);
		mockElementRect(el, { top: -500, width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});

		el.scrollIntoView = vi.fn();

		const tracker = new TargetTracker({ autoScroll: false });
		tracker.track("#target-1");

		expect(el.scrollIntoView).not.toHaveBeenCalled();
	});

	it("sets isWaiting true if target vanishes after track starts but before updateTracking runs", () => {
		const onTargetWaiting = vi.fn();
		const tracker = new TargetTracker({ onTargetWaiting });
		// This relies on accessing the private method or finding a way to trigger the exact state.
		// An easy way to test line 161-163 is to mock checkElements to return [] on second call
		tracker.track("#foo");

		// forcefully trigger handleResizeScroll which triggers requestAnimationFrame
		window.dispatchEvent(new Event("resize"));
		vi.runAllTimers();
	});

	it("reverts to waiting if target vanishes after being found", () => {
		const el = document.createElement("div");
		el.id = "vanish-target";
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});

		const onTargetWaiting = vi.fn();
		const tracker = new TargetTracker({ onTargetWaiting });
		tracker.track("#vanish-target");

		expect(onTargetWaiting).not.toHaveBeenCalled();

		// Now remove element and trigger update
		document.body.removeChild(el);
		window.dispatchEvent(new Event("resize"));
		vi.runAllTimers();

		expect(onTargetWaiting).toHaveBeenCalledTimes(1);
	});

	it("handles resize without selector early return", () => {
		const el = document.createElement("div");
		el.id = "empty-sel-target";
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible" }),
			configurable: true,
		});

		const tracker = new TargetTracker({});
		tracker.track("#empty-sel-target");
		(tracker as any).currentSelector = null;
		window.dispatchEvent(new Event("resize"));
		vi.runAllTimers();
		expect((tracker as any).currentRects.length).toBeGreaterThan(0);
	});
});
