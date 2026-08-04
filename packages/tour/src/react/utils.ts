"use client";

import * as React from "react";

/**
 * Portals and DOM measurement can't run during SSR or hydration. Components
 * gate on this so the server and first client render agree.
 */
export function useIsMounted(): boolean {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);
	return mounted;
}

export function useReducedMotion(): boolean {
	const [reduced, setReduced] = React.useState(false);

	React.useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mql.matches);
		const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
		mql.addEventListener("change", listener);
		return () => mql.removeEventListener("change", listener);
	}, []);

	return reduced;
}

export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") ref(value);
	else if (ref) (ref as React.RefObject<T | null>).current = value;
}

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled]):not([type='hidden'])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[tabindex]:not([tabindex='-1'])",
].join(",");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return [
		...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
	].filter((el) => {
		if (el.closest("[hidden]") || el.getAttribute("aria-hidden") === "true") {
			return false;
		}
		// `checkVisibility` is the accurate test but isn't everywhere yet, and
		// measuring via offsetWidth/offsetParent reports everything as hidden in
		// non-layout environments like jsdom. Treat elements as focusable unless
		// we can positively determine otherwise.
		return el.checkVisibility?.() ?? true;
	});
}

/**
 * Keydown events originating from a text-entry context belong to the user, not
 * the tour. Without this the global Arrow key shortcuts make it impossible to
 * move the caret inside any input while a tour is open.
 */
export function isFromEditableTarget(event: KeyboardEvent): boolean {
	const target = event.target as HTMLElement | null;
	if (!target) return false;
	if (target.isContentEditable) return true;

	const tag = target.tagName;
	if (tag === "TEXTAREA" || tag === "SELECT") return true;
	if (tag === "INPUT") {
		const type = (target as HTMLInputElement).type;
		// Checkboxes/buttons don't consume arrow keys, so the tour may have them.
		return type !== "checkbox" && type !== "radio" && type !== "button";
	}
	return false;
}
