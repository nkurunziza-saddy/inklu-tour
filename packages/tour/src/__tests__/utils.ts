export function mockElementRect(element: Element, rect: Partial<DOMRect>) {
	const defaultRect = {
		width: 0,
		height: 0,
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		x: 0,
		y: 0,
	};
	const finalRect = { ...defaultRect, ...rect };

	if (finalRect.right === 0 && finalRect.width > 0) {
		finalRect.right = finalRect.left + finalRect.width;
	}
	if (finalRect.bottom === 0 && finalRect.height > 0) {
		finalRect.bottom = finalRect.top + finalRect.height;
	}

	element.getBoundingClientRect = () =>
		({
			...finalRect,
			toJSON: () => finalRect,
		}) as DOMRect;
}

export function mockWindowSize(width: number, height: number) {
	Object.defineProperty(window, "innerWidth", {
		writable: true,
		configurable: true,
		value: width,
	});
	Object.defineProperty(window, "innerHeight", {
		writable: true,
		configurable: true,
		value: height,
	});
}
