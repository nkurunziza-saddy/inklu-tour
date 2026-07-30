import { describe, expect, it } from "vitest";
import { calculatePosition, rectsEqual, toRect, unionOf } from "../core/engine";
import { mockElementRect, mockWindowSize } from "./utils";

describe("engine - toRect", () => {
  it("converts DOM elements to Rect correctly", () => {
    const el = document.createElement("div");
    mockElementRect(el, { top: 10, left: 20, width: 100, height: 50 });
    // mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({ borderRadius: "8px" })
    });
    
    const rect = toRect(el);
    expect(rect).toEqual({ top: 10, left: 20, width: 100, height: 50, radius: 8 });
  });

  it("returns null for invisible elements", () => {
    const el = document.createElement("div");
    mockElementRect(el, { top: 10, left: 20, width: 0, height: 0 });
    
    const rect = toRect(el);
    expect(rect).toBeNull();
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
    expect(unionOf(rects)).toEqual({ top: 10, left: 10, width: 110, height: 130, radius: 8 });
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
});
