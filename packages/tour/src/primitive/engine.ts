import type { Rect } from "./types";

export function toRect(el: Element): Rect | null {
	const r = el.getBoundingClientRect();
	if (r.width <= 0 || r.height <= 0) return null;
	const radius = parseFloat(window.getComputedStyle(el).borderRadius) || 8;
	return { left: r.left, top: r.top, width: r.width, height: r.height, radius };
}

export function rectsEqual(a: Rect[], b: Rect[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((r, i) => {
		const o = b[i]!;
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
	const left = Math.min(...rects.map((r) => r.left));
	const top = Math.min(...rects.map((r) => r.top));
	const right = Math.max(...rects.map((r) => r.left + r.width));
	const bottom = Math.max(...rects.map((r) => r.top + r.height));
	return { left, top, width: right - left, height: bottom - top, radius: 8 };
}

export function calculatePosition(
	anchor: Rect,
	cardSize: { width: number; height: number },
	placementStr: string = "bottom-center",
): { left: number; top: number; side: string; align: string } {
	const parts = placementStr.split("-");
	let side = parts[0] || "bottom";
	const align = parts[1] || "center";
	const pad = 20;
	const vw = document.documentElement.clientWidth || window.innerWidth;
	const vh = document.documentElement.clientHeight || window.innerHeight;
	const margin = 16;

	const topSpace = anchor.top - pad;
	const bottomSpace = vh - (anchor.top + anchor.height + pad);
	const leftSpace = anchor.left - pad;
	const rightSpace = vw - (anchor.left + anchor.width + pad);

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

	return {
		left: Math.min(Math.max(left, margin), vw - cardSize.width - margin),
		top: Math.min(Math.max(top, margin), vh - cardSize.height - margin),
		side,
		align,
	};
}
