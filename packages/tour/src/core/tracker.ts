import { rectsEqual, toRect } from "./engine";
import type { Rect, TargetStrategy, TourTargetConfig } from "./types";

export const DEFAULT_TARGET_TIMEOUT = 5000;

/** Elements smaller than this in either axis are treated as not-yet-rendered. */
const MIN_TARGET_SIZE = 5;

/**
 * Attribute changes that can reveal or hide a target. Observing every attribute
 * on the whole document makes MutationObserver fire on unrelated app churn.
 */
const OBSERVED_ATTRIBUTES = ["class", "style", "hidden", "data-tour-step"];

export interface TargetTrackerOptions {
	autoScroll?: boolean;
	/** Honours `prefers-reduced-motion` when scrolling the target into view. */
	reducedMotion?: boolean;
	onTargetFound?: () => void;
	onTargetWaiting?: () => void;
	onTargetTimeout?: (strategy: TargetStrategy, selector: string) => void;
	onRectsChange?: (rects: Rect[]) => void;
}

/** `CSS.escape` isn't in every test environment; fall back to a manual escape. */
function escapeAttributeValue(value: string): string {
	if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
		return CSS.escape(value);
	}
	return value.replace(/["\\]/g, "\\$&");
}

export class TargetTracker {
	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	private observer: MutationObserver | null = null;
	private raf = 0;
	private found = false;
	private isWaiting = false;
	private cachedEls: HTMLElement[] | null = null;
	private currentRects: Rect[] = [];
	private currentSelector: string | null = null;
	/** Set once per `track()` so a re-render never re-scrolls the page. */
	private hasScrolled = false;

	constructor(private options: TargetTrackerOptions) {
		this.handleViewportChange = this.handleViewportChange.bind(this);
		this.handleMutation = this.handleMutation.bind(this);
	}

	setOptions(options: Partial<TargetTrackerOptions>) {
		this.options = { ...this.options, ...options };
	}

	track(targetDef: string | TourTargetConfig) {
		this.stop();

		if (typeof document === "undefined") return;

		const isString = typeof targetDef === "string";
		const selector = isString ? targetDef : targetDef.selector;
		const timeout = isString
			? DEFAULT_TARGET_TIMEOUT
			: (targetDef.timeout ?? DEFAULT_TARGET_TIMEOUT);
		const strategy: TargetStrategy = isString
			? "wait"
			: (targetDef.strategy ?? "wait");

		this.currentSelector = selector;

		window.addEventListener("resize", this.handleViewportChange, {
			passive: true,
		});
		window.addEventListener("scroll", this.handleViewportChange, {
			passive: true,
			capture: true,
		});

		if (this.checkElements(selector).length > 0) {
			this.syncNow();
			return;
		}

		this.isWaiting = true;
		this.options.onTargetWaiting?.();

		this.observer = new MutationObserver(this.handleMutation);
		this.observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: OBSERVED_ATTRIBUTES,
		});

		this.timeoutId = setTimeout(() => {
			this.timeoutId = null;
			if (this.found) return;
			// "wait" keeps observing indefinitely; the other strategies are
			// terminal, so stop burning cycles on a target that isn't coming.
			if (strategy !== "wait") {
				this.observer?.disconnect();
				this.observer = null;
			}
			this.options.onTargetTimeout?.(strategy, selector);
		}, timeout);
	}

	stop() {
		if (this.timeoutId) clearTimeout(this.timeoutId);
		if (this.observer) this.observer.disconnect();
		if (typeof cancelAnimationFrame !== "undefined") {
			cancelAnimationFrame(this.raf);
		}
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", this.handleViewportChange);
			window.removeEventListener("scroll", this.handleViewportChange, true);
		}
		this.timeoutId = null;
		this.observer = null;
		this.raf = 0;
		this.found = false;
		this.isWaiting = false;
		this.hasScrolled = false;
		this.cachedEls = null;
		this.currentSelector = null;
		this.currentRects = [];
	}

	private isUsable(el: HTMLElement): boolean {
		const r = el.getBoundingClientRect();
		if (r.width <= MIN_TARGET_SIZE || r.height <= MIN_TARGET_SIZE) return false;
		return window.getComputedStyle(el).visibility !== "hidden";
	}

	private queryAll(selector: string): HTMLElement[] {
		const escaped = escapeAttributeValue(selector);
		const results = new Set<HTMLElement>();

		// The two selectors are queried separately so that a caller-supplied
		// selector that isn't valid CSS (a bare step id like "1-welcome") still
		// resolves through the `data-tour-step` fallback instead of throwing away
		// both halves of the query.
		for (const candidate of [selector, `[data-tour-step="${escaped}"]`]) {
			try {
				for (const el of document.querySelectorAll<HTMLElement>(candidate)) {
					results.add(el);
				}
			} catch {
				// Invalid selector — ignore this half.
			}
		}
		return [...results];
	}

	private checkElements(selector: string): HTMLElement[] {
		if (this.cachedEls?.every((el) => el.isConnected)) {
			const stillUsable = this.cachedEls.filter((el) => this.isUsable(el));
			if (stillUsable.length > 0) return stillUsable;
		}
		const validEls = this.queryAll(selector).filter((el) => this.isUsable(el));
		this.cachedEls = validEls.length > 0 ? validEls : null;
		return validEls;
	}

	private handleMutation() {
		this.scheduleSync();
	}

	private handleViewportChange() {
		if (!this.found) return;
		this.scheduleSync();
	}

	/**
	 * Coalesce every source of change (mutations, scroll, resize) into a single
	 * measurement per frame. Measuring synchronously inside the MutationObserver
	 * callback forces a layout on every DOM write the host app makes.
	 */
	private scheduleSync() {
		if (typeof requestAnimationFrame === "undefined") {
			this.syncNow();
			return;
		}
		cancelAnimationFrame(this.raf);
		this.raf = requestAnimationFrame(() => {
			this.raf = 0;
			this.syncNow();
		});
	}

	private syncNow = () => {
		if (!this.currentSelector) return;

		const els = this.checkElements(this.currentSelector);

		if (els.length === 0) {
			if (this.found || !this.isWaiting) {
				this.found = false;
				this.isWaiting = true;
				this.currentRects = [];
				this.options.onTargetWaiting?.();
			}
			return;
		}

		if (!this.found) {
			this.found = true;
			this.isWaiting = false;
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = null;
			}
			if (this.observer) {
				this.observer.disconnect();
				this.observer = null;
			}
			this.options.onTargetFound?.();
			this.maybeScrollIntoView(els[0]);
		}

		const newRects = els
			.map((el) => toRect(el))
			.filter((r): r is Rect => r !== null);

		if (!rectsEqual(this.currentRects, newRects)) {
			this.currentRects = newRects;
			this.options.onRectsChange?.(newRects);
		}
	};

	private maybeScrollIntoView(el: HTMLElement | undefined) {
		if (!el || this.hasScrolled) return;
		if (this.options.autoScroll === false) return;

		const rect = el.getBoundingClientRect();
		const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
		// Elements taller than most of the viewport can never be "fully visible";
		// scrolling them to centre does more harm than good.
		const isHuge = rect.height >= window.innerHeight * 0.8;
		if (isVisible || isHuge) return;

		this.hasScrolled = true;
		el.scrollIntoView({
			block: "center",
			behavior: this.options.reducedMotion ? "auto" : "smooth",
		});
	}
}
