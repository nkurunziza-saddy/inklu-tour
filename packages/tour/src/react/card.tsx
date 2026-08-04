"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { createPortal } from "react-dom";
import { TOUR_ANIMATION_DURATION } from "../core/constants";
import type { Position } from "../core/engine";
import { calculatePosition, unionOf } from "../core/engine";
import { useTourContext } from "./context";
import { assignRef, getFocusableElements, useIsMounted } from "./utils";

const CardContext = React.createContext<{
	arrowStyle: React.CSSProperties;
} | null>(null);

export function useCardContext() {
	const ctx = React.useContext(CardContext);
	if (!ctx) throw new Error("Tour components must be rendered within TourCard");
	return ctx;
}

/** Assumed size for the very first paint, before the card has been measured. */
const ESTIMATED_CARD_SIZE = { width: 340, height: 200 };

const ARROW_SIZE = 14;

export interface TourCardProps extends React.HTMLAttributes<HTMLDivElement> {
	asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, TourCardProps>(
	({ style, children, asChild, ...props }, ref) => {
		const tourContext = useTourContext();
		const {
			rects,
			currentStep,
			isWaiting,
			skipAnimation,
			isAnimatingExit,
			reducedMotion,
			config,
			labelId,
			descriptionId,
			container,
			open,
			close,
		} = tourContext;

		const cardOffset = config.cardOffset ?? 16;
		const showArrow = config.showArrow ?? true;
		const zIndex = (config.zIndex ?? 9998) + 1;
		const trapFocus = config.trapFocus ?? false;
		const autoFocus = config.autoFocus ?? true;
		const closeOnOutsideClick = config.closeOnOutsideClick ?? false;

		const [cardSize, setCardSize] = React.useState(ESTIMATED_CARD_SIZE);
		const innerRef = React.useRef<HTMLDivElement>(null);
		const mounted = useIsMounted();

		React.useLayoutEffect(() => {
			const node = innerRef.current;
			if (!node) return;

			if (node.offsetWidth > 0 || node.offsetHeight > 0) {
				setCardSize({ width: node.offsetWidth, height: node.offsetHeight });
			}

			if (typeof ResizeObserver === "undefined") return;
			const ro = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const target = entry.target as HTMLDivElement;
					if (target.offsetWidth > 0) {
						setCardSize({
							width: target.offsetWidth,
							height: target.offsetHeight,
						});
					}
				}
			});
			ro.observe(node);
			return () => ro.disconnect();
		}, []);

		const anchor = unionOf(rects);

		const activePos =
			anchor && !isWaiting
				? calculatePosition(
						anchor,
						cardSize,
						currentStep?.placement,
						cardOffset,
					)
				: null;

		// Hold the last resolved position so the card doesn't jump to the corner
		// while the next step's target is still being located.
		const lastPosRef = React.useRef<Position | null>(null);
		if (activePos) lastPosRef.current = activePos;

		const pos = activePos ?? lastPosRef.current;
		const side = pos?.side ?? currentStep?.placement?.split("-")[0] ?? "bottom";

		let arrowStyle: React.CSSProperties = { display: "none" };
		if (anchor && pos && !isWaiting && showArrow) {
			const offset = ARROW_SIZE / 2;

			arrowStyle = {
				position: "absolute",
				width: ARROW_SIZE,
				height: ARROW_SIZE,
				backgroundColor: "inherit",
				borderColor: "inherit",
				borderStyle: "solid",
				transform: "rotate(45deg)",
				zIndex: -1,
				pointerEvents: "none",
			};

			if (side === "bottom") {
				arrowStyle.top = -offset;
				arrowStyle.left = pos.arrow.x - offset;
				arrowStyle.borderWidth = "1px 0 0 1px";
			} else if (side === "top") {
				arrowStyle.bottom = -offset;
				arrowStyle.left = pos.arrow.x - offset;
				arrowStyle.borderWidth = "0 1px 1px 0";
			} else if (side === "right") {
				arrowStyle.left = -offset;
				arrowStyle.top = pos.arrow.y - offset;
				arrowStyle.borderWidth = "0 0 1px 1px";
			} else if (side === "left") {
				arrowStyle.right = -offset;
				arrowStyle.top = pos.arrow.y - offset;
				arrowStyle.borderWidth = "1px 1px 0 0";
			}
		}

		const mergedRef = React.useCallback(
			(node: HTMLDivElement | null) => {
				innerRef.current = node;
				assignRef(ref, node);
			},
			[ref],
		);

		const [isTransitioning, setIsTransitioning] = React.useState(false);
		const prevStepId = React.useRef(currentStep?.id);

		if (currentStep?.id !== prevStepId.current) {
			setIsTransitioning(!skipAnimation);
			prevStepId.current = currentStep?.id;
		}

		React.useEffect(() => {
			if (!isTransitioning) return;
			const t = setTimeout(
				() => setIsTransitioning(false),
				skipAnimation ? 0 : TOUR_ANIMATION_DURATION,
			);
			return () => clearTimeout(t);
		}, [isTransitioning, skipAnimation]);

		// Move focus into the card once per opening, not on every step, so the
		// user keeps control of the caret while a tour is running.
		React.useEffect(() => {
			if (!open || !autoFocus || !mounted) return;
			const frame = requestAnimationFrame(() => {
				innerRef.current?.focus({ preventScroll: true });
			});
			return () => cancelAnimationFrame(frame);
		}, [open, autoFocus, mounted]);

		React.useEffect(() => {
			if (!open || !trapFocus) return;
			const onKeyDown = (e: KeyboardEvent) => {
				if (e.key !== "Tab" || e.defaultPrevented) return;
				const node = innerRef.current;
				if (!node) return;

				const focusables = getFocusableElements(node);
				if (focusables.length === 0) {
					e.preventDefault();
					node.focus({ preventScroll: true });
					return;
				}

				const first = focusables[0] as HTMLElement;
				const last = focusables[focusables.length - 1] as HTMLElement;
				const active = document.activeElement;

				if (!node.contains(active)) {
					e.preventDefault();
					(e.shiftKey ? last : first).focus();
				} else if (e.shiftKey && (active === first || active === node)) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && active === last) {
					e.preventDefault();
					first.focus();
				}
			};
			document.addEventListener("keydown", onKeyDown, true);
			return () => document.removeEventListener("keydown", onKeyDown, true);
		}, [open, trapFocus]);

		React.useEffect(() => {
			if (!open || !closeOnOutsideClick) return;
			const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
				const node = innerRef.current;
				const path = e.composedPath?.();
				if (
					node &&
					(path ? path.includes(node) : node.contains(e.target as Node))
				)
					return;
				close();
			};
			// Deferred so the click that opened the tour doesn't immediately close it.
			const timer = setTimeout(() => {
				document.addEventListener("pointerdown", handleOutsideClick);
			}, 50);
			return () => {
				clearTimeout(timer);
				document.removeEventListener("pointerdown", handleOutsideClick);
			};
		}, [open, closeOnOutsideClick, close]);

		if (!mounted) return null;

		const Comp = asChild ? Slot : "div";
		const transitionDuration = skipAnimation ? 0 : TOUR_ANIMATION_DURATION;

		let transformOrigin = "center";
		if (side === "bottom") transformOrigin = "top center";
		else if (side === "top") transformOrigin = "bottom center";
		else if (side === "right") transformOrigin = "left center";
		else if (side === "left") transformOrigin = "right center";

		return createPortal(
			<CardContext.Provider value={{ arrowStyle }}>
				<Comp
					ref={mergedRef}
					role="dialog"
					aria-modal={trapFocus ? true : undefined}
					aria-labelledby={labelId}
					aria-describedby={descriptionId}
					tabIndex={-1}
					data-state={isWaiting ? "waiting" : "found"}
					data-side={side}
					data-open={!isAnimatingExit}
					{...props}
					style={{
						position: "fixed",
						zIndex,
						transformOrigin,
						...(pos
							? {
									left: 0,
									top: 0,
									transform: `translate(${pos.left}px, ${pos.top}px)`,
									transition:
										isTransitioning && !reducedMotion
											? `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
											: "none",
								}
							: { bottom: "24px", right: "24px" }),
						...style,
					}}
				>
					{children}
				</Comp>
			</CardContext.Provider>,
			container ?? document.body,
		);
	},
);

Card.displayName = "Tour.Card";

export interface TourArrowProps extends React.HTMLAttributes<HTMLDivElement> {
	asChild?: boolean;
}

export const Arrow = React.forwardRef<HTMLDivElement, TourArrowProps>(
	({ style, asChild, ...props }, ref) => {
		const { arrowStyle } = useCardContext();
		const Comp = asChild ? Slot : "div";
		return (
			<Comp
				ref={ref}
				aria-hidden="true"
				style={{ ...arrowStyle, ...style }}
				{...props}
			/>
		);
	},
);
Arrow.displayName = "Tour.Arrow";

export interface TourButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

export const NextButton = React.forwardRef<HTMLButtonElement, TourButtonProps>(
	({ onClick, asChild, type = "button", ...props }, ref) => {
		const { next } = useTourContext();
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				type={type}
				data-sound-click="turn:forward"
				{...props}
				onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
					onClick?.(e);
					if (!e.defaultPrevented) next();
				}}
			/>
		);
	},
);

NextButton.displayName = "Tour.NextButton";

export const PreviousButton = React.forwardRef<
	HTMLButtonElement,
	TourButtonProps
>(({ onClick, asChild, type = "button", ...props }, ref) => {
	const { previous, currentStepIndex } = useTourContext();
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			ref={ref}
			type={type}
			data-sound-click="turn:backward"
			disabled={currentStepIndex === 0}
			{...props}
			onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(e);
				if (!e.defaultPrevented) previous();
			}}
		/>
	);
});

PreviousButton.displayName = "Tour.PreviousButton";

export const CloseButton = React.forwardRef<HTMLButtonElement, TourButtonProps>(
	({ onClick, asChild, type = "button", ...props }, ref) => {
		const { close } = useTourContext();
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				type={type}
				data-sound-click="close"
				{...props}
				onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
					onClick?.(e);
					if (!e.defaultPrevented) close();
				}}
			/>
		);
	},
);

CloseButton.displayName = "Tour.CloseButton";
