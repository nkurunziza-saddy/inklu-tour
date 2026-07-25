"use client";

import * as React from "react";
import { rectsEqual, toRect } from "./engine";
import type { Rect, TargetStrategy, TourStep } from "./types";

export function useTourTarget(
	step: TourStep | null,
	options: {
		onTargetWaiting?: (stepId: string) => void;
		onTargetFound?: (stepId: string) => void;
		onTargetTimeout?: (stepId: string) => void;
		onSkip?: () => void;
	},
) {
	const [rectState, setRectState] = React.useState<{
		items: Rect[];
		stepId: string | null;
	}>({ items: [], stepId: null });
	const rects = rectState.items;
	const [isWaiting, setIsWaiting] = React.useState(false);
	const optionsRef = React.useRef(options);

	React.useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	React.useEffect(() => {
		if (!step) {
			setRectState({ items: [], stepId: null });
			setIsWaiting(false);
			return;
		}

		const targetDef = step.target ?? step.id;
		const selector =
			typeof targetDef === "string" ? targetDef : targetDef.selector;
		const timeout =
			typeof targetDef === "string" ? 5000 : (targetDef.timeout ?? 5000);
		const strategy: TargetStrategy =
			typeof targetDef === "string" ? "wait" : (targetDef.strategy ?? "wait");

		let timeoutId: number | null = null;
		let observer: MutationObserver | null = null;
		let raf: number;
		let found = false;

		let cachedEls: HTMLElement[] | null = null;

		function checkElements() {
			if (cachedEls && cachedEls.every((el) => document.body.contains(el))) {
				return cachedEls.filter((el) => {
					const r = el.getBoundingClientRect();
					return (
						r.width > 5 &&
						r.height > 5 &&
						window.getComputedStyle(el).visibility !== "hidden"
					);
				});
			}

			try {
				const els = Array.from(
					document.querySelectorAll<HTMLElement>(
						`${selector}, [data-tour-step="${selector}"]`,
					),
				);

				const validEls = els.filter((el) => {
					const r = el.getBoundingClientRect();
					return (
						r.width > 5 &&
						r.height > 5 &&
						window.getComputedStyle(el).visibility !== "hidden"
					);
				});

				cachedEls = validEls.length > 0 ? validEls : null;
				return validEls;
			} catch {
				cachedEls = null;
				return [];
			}
		}

		function update() {
			const els = checkElements();
			if (els.length > 0) {
				if (!found) {
					found = true;
					setIsWaiting(false);
					if (timeoutId) clearTimeout(timeoutId);
					if (observer) observer.disconnect();
					optionsRef.current.onTargetFound?.(step!.id);

					// Only scroll if the element is not in the viewport or is reasonably sized
					const rect = els[0]?.getBoundingClientRect();
					if (rect) {
						const isVisible =
							rect.top >= 0 && rect.bottom <= window.innerHeight;
						const isHuge = rect.height >= window.innerHeight * 0.8;
						if (!isVisible && !isHuge) {
							els[0]?.scrollIntoView({ block: "center", behavior: "instant" });
						}
					}
				}
				const newRects = els.flatMap((el) => {
					const r = toRect(el);
					return r ? [r] : [];
				});
				setRectState((prev) =>
					rectsEqual(prev.items, newRects) && prev.stepId === step!.id
						? prev
						: { items: newRects, stepId: step!.id },
				);
			} else if (!found && !isWaiting) {
				setIsWaiting(true);
				optionsRef.current.onTargetWaiting?.(step!.id);
			}
		}

		const initialEls = checkElements();
		if (initialEls.length > 0) {
			update();
		} else {
			setIsWaiting(true);
			optionsRef.current.onTargetWaiting?.(step!.id);

			observer = new MutationObserver(update);
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});

			timeoutId = window.setTimeout(() => {
				if (!found) {
					optionsRef.current.onTargetTimeout?.(step!.id);
					if (strategy === "skip") {
						observer?.disconnect();
						optionsRef.current.onSkip?.();
					} else if (strategy === "error") {
						observer?.disconnect();
						throw new Error(`Tour target timeout: ${selector}`);
					}
				}
			}, timeout);
		}

		const scheduleUpdate = () => {
			if (!found) return;
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(update);
		};

		window.addEventListener("resize", scheduleUpdate);
		window.addEventListener("scroll", scheduleUpdate, true);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (observer) observer.disconnect();
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", scheduleUpdate);
			window.removeEventListener("scroll", scheduleUpdate, true);
		};
	}, [step]); // options omitted so we don't restart effect on every render

	return { rects, rectsStepId: rectState.stepId, isWaiting };
}
