import { rectsEqual, toRect } from "./engine";
import type { Rect, TargetStrategy, TourTargetConfig } from "./types";

export interface TargetTrackerOptions {
	autoScroll?: boolean;
	onTargetFound?: () => void;
	onTargetWaiting?: () => void;
	onTargetTimeout?: (strategy: TargetStrategy, selector: string) => void;
	onRectsChange?: (rects: Rect[]) => void;
}

export class TargetTracker {
	private timeoutId: number | null = null;
	private observer: MutationObserver | null = null;
	private raf: number = 0;
	private found = false;
	private isWaiting = false;
	private cachedEls: HTMLElement[] | null = null;
	private currentRects: Rect[] = [];

	private currentSelector: string | null = null;

	constructor(private options: TargetTrackerOptions) {
		this.handleResizeScroll = this.handleResizeScroll.bind(this);
	}

	setOptions(options: TargetTrackerOptions) {
		this.options = options;
	}

	track(targetDef: string | TourTargetConfig) {
		this.stop();

		const selector =
			typeof targetDef === "string" ? targetDef : targetDef.selector;
		const timeout =
			typeof targetDef === "string" ? 5000 : (targetDef.timeout ?? 5000);
		const strategy: TargetStrategy =
			typeof targetDef === "string" ? "wait" : (targetDef.strategy ?? "wait");

		this.currentSelector = selector;

		const initialEls = this.checkElements(selector);
		if (initialEls.length > 0) {
			this.updateTracking();
		} else {
			this.isWaiting = true;
			this.options.onTargetWaiting?.();

			this.observer = new MutationObserver(this.updateTracking);
			this.observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});

			this.timeoutId = window.setTimeout(() => {
				if (!this.found) {
					this.options.onTargetTimeout?.(strategy, selector);
				}
			}, timeout);
		}

		if (typeof window !== "undefined") {
			window.addEventListener("resize", this.handleResizeScroll);
			window.addEventListener("scroll", this.handleResizeScroll, true);
		}
	}

	stop() {
		if (this.timeoutId) clearTimeout(this.timeoutId);
		if (this.observer) this.observer.disconnect();
		cancelAnimationFrame(this.raf);
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", this.handleResizeScroll);
			window.removeEventListener("scroll", this.handleResizeScroll, true);
		}
		this.timeoutId = null;
		this.observer = null;
		this.found = false;
		this.isWaiting = false;
		this.cachedEls = null;
		this.currentSelector = null;
		this.currentRects = [];
	}

	private checkElements(selector: string) {
		if (this.cachedEls?.every((el) => document.body.contains(el))) {
			return this.cachedEls.filter((el) => {
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
			this.cachedEls = validEls.length > 0 ? validEls : null;
			return validEls;
		} catch {
			this.cachedEls = null;
			return [];
		}
	}

	private handleResizeScroll() {
		if (!this.found) return;
		cancelAnimationFrame(this.raf);
		this.raf = requestAnimationFrame(() => this.updateTracking());
	}

	private updateTracking = () => {
		if (!this.currentSelector) return;

		const els = this.checkElements(this.currentSelector);

		if (els.length > 0) {
			if (!this.found) {
				this.found = true;
				this.isWaiting = false;

				if (this.timeoutId) clearTimeout(this.timeoutId);
				if (this.observer) this.observer.disconnect();
				this.options.onTargetFound?.();

				if (this.options.autoScroll !== false) {
					const rect = els[0]?.getBoundingClientRect();
					if (rect) {
						const isVisible =
							rect.top >= 0 && rect.bottom <= window.innerHeight;
						const isHuge = rect.height >= window.innerHeight * 0.8;
						if (!isVisible && !isHuge) {
							els[0]?.scrollIntoView({ block: "center", behavior: "smooth" });
						}
					}
				}
			}
			const newRects = els.flatMap((el) => {
				const r = toRect(el);
				return r ? [r] : [];
			});

			if (!rectsEqual(this.currentRects, newRects)) {
				this.currentRects = newRects;
				this.options.onRectsChange?.(newRects);
			}
		} else if (!this.found && !this.isWaiting) {
			this.isWaiting = true;
			this.options.onTargetWaiting?.();
		}
	};
}
