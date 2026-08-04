import { describe, expect, it } from "vitest";
import { calculatePosition, rectsEqual, toRect, unionOf } from "../core/engine";
import { mockElementRect, mockWindowSize } from "./utils";

describe("engine - toRect", () => {
	it("converts DOM elements to Rect correctly", () => {
		const el = document.createElement("div");
		mockElementRect(el, { top: 10, left: 20, width: 100, height: 50 });
		// mock getComputedStyle
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ borderRadius: "8px" }),
		});

		const rect = toRect(el);
		expect(rect).toEqual({
			top: 10,
			left: 20,
			width: 100,
			height: 50,
			radius: 8,
		});
	});

	it("returns null for invisible elements", () => {
		const el = document.createElement("div");
		mockElementRect(el, { top: 10, left: 20, width: 0, height: 0 });

		const rect = toRect(el);
		expect(rect).toBeNull();
	});

	it("preserves a real zero radius instead of falling back to 8", () => {
		const el = document.createElement("div");
		mockElementRect(el, { top: 0, left: 0, width: 10, height: 10 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ borderRadius: "0px" }),
			configurable: true,
		});
		expect(toRect(el)?.radius).toBe(0);
	});

	it("falls back to 8 when the radius is not parseable", () => {
		const el = document.createElement("div");
		mockElementRect(el, { top: 0, left: 0, width: 10, height: 10 });
		Object.defineProperty(window, "getComputedStyle", {
			value: () => ({ borderRadius: "" }),
			configurable: true,
		});
		expect(toRect(el)?.radius).toBe(8);
	});
});

describe("engine - rectsEqual", () => {
	it("returns true if rects are equal", () => {
		const a = [{ top: 10, left: 20, width: 100, height: 50, radius: 8 }];
		const b = [{ top: 10, left: 20, width: 100, height: 50, radius: 8 }];
		expect(rectsEqual(a, b)).toBe(true);
	});

	it("returns false if lengths differ", () => {
		const a = [{ top: 10, left: 20, width: 100, height: 50, radius: 8 }];
		expect(rectsEqual(a, [])).toBe(false);
	});

	it("returns false if values differ", () => {
		const a = [{ top: 10, left: 20, width: 100, height: 50, radius: 8 }];
		const b = [{ top: 10, left: 21, width: 100, height: 50, radius: 8 }];
		expect(rectsEqual(a, b)).toBe(false);
	});

	it("returns false rather than throwing on a sparse counterpart", () => {
		const a = [{ top: 10, left: 20, width: 100, height: 50, radius: 8 }];
		expect(rectsEqual(a, new Array(1))).toBe(false);
	});
});

describe("engine - unionOf", () => {
	it("computes the bounding box of multiple rects", () => {
		const rects = [
			{ top: 10, left: 20, width: 100, height: 50, radius: 8 },
			{ top: 40, left: 10, width: 50, height: 100, radius: 8 },
		];
		// left: min(20, 10) = 10
		// top: min(10, 40) = 10
		// right: max(120, 60) = 120 -> width = 110
		// bottom: max(60, 140) = 140 -> height = 130
		expect(unionOf(rects)).toEqual({
			top: 10,
			left: 10,
			width: 110,
			height: 130,
			radius: 8,
		});
	});

	it("returns null for empty array", () => {
		expect(unionOf([])).toBeNull();
	});
});

describe("engine - calculatePosition", () => {
	it("positions bottom-center by default", () => {
		mockWindowSize(1024, 768);
		const anchor = { top: 100, left: 100, width: 200, height: 50, radius: 8 };
		const cardSize = { width: 300, height: 100 };
		const pos = calculatePosition(anchor, cardSize);

		// bottom = anchor.top + height + pad = 100 + 50 + 16 = 166
		// center = anchor.left + (anchor.width / 2) - (cardSize.width / 2) = 100 + 100 - 150 = 50
		expect(pos.top).toBe(166);
		expect(pos.left).toBe(50);
		expect(pos.side).toBe("bottom");
		expect(pos.align).toBe("center");
	});

	it("flips to top if there is not enough room at the bottom", () => {
		mockWindowSize(1024, 768);
		// Anchor very close to the bottom
		const anchor = { top: 700, left: 100, width: 200, height: 50, radius: 8 };
		const cardSize = { width: 300, height: 100 };
		// card padding is 16. Available bottom space is 768 - (700 + 50 + 16) = 2.
		// top space = 700 - 16 = 684.
		// It should flip to top.
		const pos = calculatePosition(anchor, cardSize, "bottom-center");

		// top = anchor.top - pad - cardSize.height = 700 - 16 - 100 = 584
		expect(pos.top).toBe(584);
		expect(pos.side).toBe("top");
	});

	it("clamps to viewport edges", () => {
		mockWindowSize(1024, 768);
		// Anchor at the very left edge
		const anchor = { top: 100, left: 0, width: 50, height: 50, radius: 8 };
		const cardSize = { width: 300, height: 100 };
		const pos = calculatePosition(anchor, cardSize, "bottom-center");

		// Unclamped left: 0 + 25 - 150 = -125.
		// Margin is 16.
		expect(pos.left).toBe(16);
		// Arrow should point to the center of anchor: 0 + 25 = 25 relative to viewport.
		// relative to card: 25 - 16 = 9. But arrow is clamped to 20!
		expect(pos.arrow.x).toBe(20);
	});
	it("flips from top to bottom if not enough space above", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 500, top: 100, width: 100, height: 100, radius: 0 };
		const result = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"top-center",
			16,
		);
		expect(result.side).toBe("bottom");
	});

	it("flips from left to right if not enough space on left", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 100, top: 500, width: 100, height: 100, radius: 0 };
		const result = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"left-center",
			16,
		);
		expect(result.side).toBe("right");
	});

	it("flips from right to left if not enough space on right", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 900, top: 500, width: 100, height: 100, radius: 0 };
		const result = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"right-center",
			16,
		);
		expect(result.side).toBe("left");
	});

	it("aligns end on top/bottom", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 100, top: 100, width: 100, height: 100, radius: 0 };
		const result = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"bottom-end",
			16,
		);
		expect(result.align).toBe("end");
		expect(result.left).toBe(16);
	});

	it("aligns start on top/bottom", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 300, top: 100, width: 100, height: 100, radius: 0 };
		const result = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"bottom-start",
			16,
		);
		expect(result.align).toBe("start");
		expect(result.left).toBe(300);
	});

	it("aligns start and end on left/right", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 500, top: 500, width: 100, height: 100, radius: 0 };

		const r1 = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"right-start",
			16,
		);
		expect(r1.side).toBe("right");
		expect(r1.align).toBe("start");
		expect(r1.top).toBe(500);

		const r2 = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"left-end",
			16,
		);
		expect(r2.side).toBe("left");
		expect(r2.align).toBe("end");
		expect(r2.top).toBe(500 + 100 - 200);
	});

	it("handles missing placement parts using default bottom-center", () => {
		mockWindowSize(1024, 768);
		const anchor = { left: 100, top: 100, width: 100, height: 100, radius: 0 };
		const r = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			undefined,
			16,
		);
		expect(r.side).toBe("bottom");
		expect(r.align).toBe("center");

		// A bare side is treated as `${side}-center`.
		const bare = calculatePosition(
			anchor,
			{ width: 200, height: 200 },
			"top",
			16,
		);
		expect(bare.align).toBe("center");
	});

	it("keeps the card on screen when it is larger than the viewport", () => {
		mockWindowSize(320, 480);
		const anchor = { left: 100, top: 100, width: 50, height: 50, radius: 0 };
		const r = calculatePosition(
			anchor,
			{ width: 800, height: 900 },
			"bottom",
			16,
		);
		// The clamp range is inverted here; pinning to the margin keeps the card's
		// top-left corner visible rather than pushing it off the edge.
		expect(r.left).toBe(16);
		expect(r.top).toBe(16);
	});
});
