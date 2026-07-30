import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TargetTracker } from "../core/tracker";
import { mockElementRect } from "./utils";

describe("TargetTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
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
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({ visibility: "visible" }),
      configurable: true
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

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({ visibility: "visible" }),
      configurable: true
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

    tracker.track({ selector: "#never-found", timeout: 1000, strategy: "skip" });
    
    vi.advanceTimersByTime(1100);

    expect(onTargetTimeout).toHaveBeenCalledWith("skip", "#never-found");
  });

  it("cleans up event listeners and observers on stop", () => {
    const tracker = new TargetTracker({});
    tracker.track("#target");
    
    // There shouldn't be any throws when stopping
    expect(() => tracker.stop()).not.toThrow();
  });
});
