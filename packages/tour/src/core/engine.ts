import type { Align, Placement, Rect, Side } from "./types";

/** Fallback corner radius when an element's computed radius can't be parsed. */
const FALLBACK_RADIUS = 8;

/** Minimum gap kept between the card and the viewport edge. */
const VIEWPORT_MARGIN = 16;

/** How far the arrow is kept from the card's corners. */
const ARROW_INSET = 20;

export function toRect(el: Element): Rect | null {
	const r = el.getBoundingClientRect();
	if (r.width <= 0 || r.height <= 0) return null;
	// `borderRadius` can be a shorthand ("8px 8px 0 0") or a percentage; take the
	// first component and fall back only when it isn't a usable number. A real
	// radius of 0 must survive, otherwise square targets get rounded cutouts.
	const parsed = Number.parseFloat(window.getComputedStyle(el).borderRadius);
	const radius = Number.isFinite(parsed)
		? Math.max(parsed, 0)
		: FALLBACK_RADIUS;
	return { left: r.left, top: r.top, width: r.width, height: r.height, radius };
}

export function rectsEqual(a: Rect[], b: Rect[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((r, i) => {
		const o = b[i];
		if (!o) return false;
		return (
			r.left === o.left &&
			r.top === o.top &&
			r.width === o.width &&
			r.height === o.height &&
			r.radius === o.radius
		);
	});
}

export function unionOf(rects: Rect[]): Rect | null {
	if (!rects.length) return null;
	let left = Number.POSITIVE_INFINITY;
	let top = Number.POSITIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let radius = 0;
	for (const r of rects) {
		if (r.left < left) left = r.left;
		if (r.top < top) top = r.top;
		if (r.left + r.width > right) right = r.left + r.width;
		if (r.top + r.height > bottom) bottom = r.top + r.height;
		if (r.radius > radius) radius = r.radius;
	}
	return { left, top, width: right - left, height: bottom - top, radius };
}

/** Clamp `value` into `[min, max]`, tolerating an inverted range. */
function clamp(value: number, min: number, max: number): number {
	// When the card is larger than the viewport, `max < min`; pinning to `min`
	// keeps the card's top-left on screen rather than pushing it off the edge.
	if (max < min) return min;
	return Math.min(Math.max(value, min), max);
}

export interface Position {
	left: number;
	top: number;
	side: Side;
	align: Align;
	arrow: { x: number; y: number };
}

export function calculatePosition(
	anchor: Rect,
	cardSize: { width: number; height: number },
	placement: Placement = "bottom-center",
	cardOffset = 16,
): Position {
	const [rawSide, rawAlign] = placement.split("-");
	let side = (rawSide || "bottom") as Side;
	const align = (rawAlign || "center") as Align;
	const pad = cardOffset;
	const vw = document.documentElement.clientWidth || window.innerWidth;
	const vh = document.documentElement.clientHeight || window.innerHeight;

	const topSpace = anchor.top - pad;
	const bottomSpace = vh - (anchor.top + anchor.height + pad);
	const leftSpace = anchor.left - pad;
	const rightSpace = vw - (anchor.left + anchor.width + pad);

	// Flip to the opposite side when the preferred one can't fit the card and the
	// opposite one has more room.
	if (
		side === "bottom" &&
		bottomSpace < cardSize.height &&
		topSpace > bottomSpace
	)
		side = "top";
	else if (
		side === "top" &&
		topSpace < cardSize.height &&
		bottomSpace > topSpace
	)
		side = "bottom";
	else if (
		side === "left" &&
		leftSpace < cardSize.width &&
		rightSpace > leftSpace
	)
		side = "right";
	else if (
		side === "right" &&
		rightSpace < cardSize.width &&
		leftSpace > rightSpace
	)
		side = "left";

	let left = 0;
	let top = 0;

	if (side === "top" || side === "bottom") {
		top =
			side === "top"
				? anchor.top - pad - cardSize.height
				: anchor.top + anchor.height + pad;
		if (align === "start") left = anchor.left;
		else if (align === "end")
			left = anchor.left + anchor.width - cardSize.width;
		else left = anchor.left + anchor.width / 2 - cardSize.width / 2;
	} else {
		left =
			side === "left"
				? anchor.left - pad - cardSize.width
				: anchor.left + anchor.width + pad;
		if (align === "start") top = anchor.top;
		else if (align === "end")
			top = anchor.top + anchor.height - cardSize.height;
		else top = anchor.top + anchor.height / 2 - cardSize.height / 2;
	}

	const clampedLeft = clamp(
		left,
		VIEWPORT_MARGIN,
		vw - cardSize.width - VIEWPORT_MARGIN,
	);
	const clampedTop = clamp(
		top,
		VIEWPORT_MARGIN,
		vh - cardSize.height - VIEWPORT_MARGIN,
	);

	// Arrow is positioned relative to the card, pointing back at the anchor's centre.
	const arrowX = clamp(
		anchor.left + anchor.width / 2 - clampedLeft,
		ARROW_INSET,
		Math.max(ARROW_INSET, cardSize.width - ARROW_INSET),
	);
	const arrowY = clamp(
		anchor.top + anchor.height / 2 - clampedTop,
		ARROW_INSET,
		Math.max(ARROW_INSET, cardSize.height - ARROW_INSET),
	);

	return {
		left: clampedLeft,
		top: clampedTop,
		side,
		align,
		arrow: { x: arrowX, y: arrowY },
	};
}
