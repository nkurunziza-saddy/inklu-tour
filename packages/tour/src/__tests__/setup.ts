import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

class MockIntersectionObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}
window.IntersectionObserver =
	MockIntersectionObserver as unknown as typeof IntersectionObserver;

class MockResizeObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

Object.defineProperty(window, "innerWidth", {
	writable: true,
	configurable: true,
	value: 1024,
});
Object.defineProperty(window, "innerHeight", {
	writable: true,
	configurable: true,
	value: 768,
});

// jsdom has no layout engine, so every element measures 0x0 unless a test opts
// into a size via `mockElementRect`.
Element.prototype.getBoundingClientRect = () =>
	({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	}) as DOMRect;

// The tour portals into document.body; without an explicit cleanup those nodes
// leak between tests and queries start matching the previous test's card.
afterEach(() => {
	cleanup();
	document.body.innerHTML = "";
});
