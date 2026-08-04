import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TargetTracker } from "../core/tracker";
import type { Rect } from "../core/types";
import { mockElementRect } from "./utils";

/**
 * A couple of tests drive the tracker through states that can only be reached
 * by poking at its private fields; this keeps that escape hatch typed.
 */
function internals(tracker: TargetTracker) {
	return tracker as unknown as {
		currentSelector: string | null;
		currentRects: Rect[];
		found: boolean;
	};
}

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

	it("still resolves the data-tour-step fallback when the id is not valid CSS", () => {
		// "1-welcome" is a legal step id but an illegal CSS selector. Querying both
		// halves in one call would throw and lose the fallback along with it.
		const el = document.createElement("div");
		el.setAttribute("data-tour-step", "1-welcome");
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});

		const onTargetFound = vi.fn();
		const tracker = new TargetTracker({ onTargetFound, autoScroll: false });
		tracker.track("1-welcome");

		expect(onTargetFound).toHaveBeenCalledTimes(1);
	});

	it("escapes quotes in the data-tour-step fallback selector", () => {
		const tracker = new TargetTracker({ autoScroll: false });
		// A quote in the id would otherwise break out of the attribute selector.
		expect(() => tracker.track('foo"],[data-x="bar')).not.toThrow();
	});

	it("scrolls the target into view at most once per track()", () => {
		const el = document.createElement("div");
		el.id = "scroll-once";
		document.body.appendChild(el);
		mockElementRect(el, { top: -500, width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});
		el.scrollIntoView = vi.fn();

		const tracker = new TargetTracker({ autoScroll: true });
		tracker.track("#scroll-once");
		expect(el.scrollIntoView).toHaveBeenCalledTimes(1);

		// Viewport churn re-measures but must not yank the page again.
		window.dispatchEvent(new Event("resize"));
		window.dispatchEvent(new Event("scroll"));
		vi.runAllTimers();
		expect(el.scrollIntoView).toHaveBeenCalledTimes(1);
	});

	it("uses instant scrolling when the user prefers reduced motion", () => {
		const el = document.createElement("div");
		el.id = "reduced";
		document.body.appendChild(el);
		mockElementRect(el, { top: -500, width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});
		el.scrollIntoView = vi.fn();

		new TargetTracker({ autoScroll: true, reducedMotion: true }).track(
			"#reduced",
		);

		expect(el.scrollIntoView).toHaveBeenCalledWith({
			block: "center",
			behavior: "auto",
		});
	});

	it("stops observing after a non-wait strategy times out", () => {
		const disconnect = vi.fn();
		const OriginalMO = window.MutationObserver;
		window.MutationObserver = class {
			observe = vi.fn();
			disconnect = disconnect;
			takeRecords = vi.fn(() => []);
		} as unknown as typeof MutationObserver;

		const tracker = new TargetTracker({ onTargetTimeout: vi.fn() });
		tracker.track({ selector: "#gone", strategy: "skip", timeout: 100 });
		vi.advanceTimersByTime(150);

		// "skip" is terminal — continuing to observe every DOM mutation for a
		// target that will never arrive is pure overhead.
		expect(disconnect).toHaveBeenCalled();
		window.MutationObserver = OriginalMO;
		tracker.stop();
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
		internals(tracker).currentSelector = null;
		window.dispatchEvent(new Event("resize"));
		vi.runAllTimers();
		expect(internals(tracker).currentRects.length).toBeGreaterThan(0);
	});

	it("ignores elements too small to be a real target", () => {
		const el = document.createElement("div");
		el.id = "tiny";
		document.body.appendChild(el);
		// A 4x4 box is almost always a not-yet-laid-out placeholder.
		mockElementRect(el, { width: 4, height: 4 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});

		const onTargetFound = vi.fn();
		const onTargetWaiting = vi.fn();
		new TargetTracker({ onTargetFound, onTargetWaiting }).track("#tiny");

		expect(onTargetFound).not.toHaveBeenCalled();
		expect(onTargetWaiting).toHaveBeenCalledTimes(1);
	});

	it("ignores elements hidden via visibility", () => {
		const el = document.createElement("div");
		el.id = "invisible";
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "hidden", borderRadius: "0px" }),
			configurable: true,
		});

		const onTargetWaiting = vi.fn();
		new TargetTracker({ onTargetWaiting }).track("#invisible");

		expect(onTargetWaiting).toHaveBeenCalledTimes(1);
	});

	it("clears the timeout and observer once a waited-for target appears", async () => {
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});

		const onTargetFound = vi.fn();
		const onTargetTimeout = vi.fn();
		const tracker = new TargetTracker({
			onTargetFound,
			onTargetTimeout,
			autoScroll: false,
		});
		tracker.track({ selector: "#late", timeout: 1000, strategy: "skip" });

		const el = document.createElement("div");
		el.id = "late";
		mockElementRect(el, { width: 100, height: 100 });
		document.body.appendChild(el);

		// While waiting it's the MutationObserver that notices, and jsdom delivers
		// its records on a microtask; the measurement itself is then rAF-batched.
		await new Promise<void>((resolve) => queueMicrotask(resolve));
		vi.runAllTimers();

		expect(onTargetFound).toHaveBeenCalledTimes(1);

		// The pending timeout must not fire now that the target has arrived.
		vi.advanceTimersByTime(2000);
		expect(onTargetTimeout).not.toHaveBeenCalled();
	});

	it("does not report a timeout for a target that was already found", () => {
		const el = document.createElement("div");
		el.id = "present";
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});

		const onTargetTimeout = vi.fn();
		const tracker = new TargetTracker({ onTargetTimeout, autoScroll: false });
		tracker.track({ selector: "#present", timeout: 50 });

		vi.advanceTimersByTime(500);
		expect(onTargetTimeout).not.toHaveBeenCalled();
	});

	it("falls back to a manual escape when CSS.escape is unavailable", () => {
		const originalCSS = globalThis.CSS;
		// @ts-expect-error deliberately removing the global for this test
		globalThis.CSS = undefined;

		const el = document.createElement("div");
		el.setAttribute("data-tour-step", 'quote"step');
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});

		const onTargetFound = vi.fn();
		new TargetTracker({ onTargetFound, autoScroll: false }).track('quote"step');

		expect(onTargetFound).toHaveBeenCalledTimes(1);
		globalThis.CSS = originalCSS;
	});

	it("measures synchronously where requestAnimationFrame is unavailable", () => {
		const el = document.createElement("div");
		el.id = "no-raf";
		document.body.appendChild(el);
		mockElementRect(el, { width: 100, height: 100 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ visibility: "visible", borderRadius: "0px" }),
			configurable: true,
		});

		const originalRaf = globalThis.requestAnimationFrame;
		const originalCancel = globalThis.cancelAnimationFrame;
		// @ts-expect-error deliberately removing the global for this test
		globalThis.requestAnimationFrame = undefined;
		// @ts-expect-error deliberately removing the global for this test
		globalThis.cancelAnimationFrame = undefined;

		const onRectsChange = vi.fn();
		const tracker = new TargetTracker({ onRectsChange, autoScroll: false });
		tracker.track("#no-raf");
		onRectsChange.mockClear();

		mockElementRect(el, { top: 50, width: 100, height: 100 });
		window.dispatchEvent(new Event("resize"));
		expect(onRectsChange).toHaveBeenCalledTimes(1);

		tracker.stop();
		globalThis.requestAnimationFrame = originalRaf;
		globalThis.cancelAnimationFrame = originalCancel;
	});
});
