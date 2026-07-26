"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { createPortal } from "react-dom";
import { TOUR_ANIMATION_DURATION, useTourContext } from "./context";
import { calculatePosition, unionOf } from "./engine";

const CardContext = React.createContext<{
	arrowStyle: React.CSSProperties;
} | null>(null);

export function useCardContext() {
	const ctx = React.useContext(CardContext);
	if (!ctx) throw new Error("Tour components must be rendered within TourCard");
	return ctx;
}

export interface TourCardProps extends React.HTMLAttributes<HTMLDivElement> {
	asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, TourCardProps>(
	({ style, children, asChild, ...props }, ref) => {
		const {
			rects,
			currentStep,
			isWaiting,
			skipAnimation,
			isAnimatingExit,
			reducedMotion,
		} = useTourContext();
		const [cardSize, setCardSize] = React.useState<{
			width: number;
			height: number;
		}>({ width: 340, height: 200 }); // Default size so it positions immediately
		const innerRef = React.useRef<HTMLDivElement>(null);

		const [mounted, setMounted] = React.useState(false);
		React.useEffect(() => setMounted(true), []);

		React.useLayoutEffect(() => {
			if (!innerRef.current) return;
			const node = innerRef.current;

			if (node.offsetWidth > 0 || node.offsetHeight > 0) {
				setCardSize({ width: node.offsetWidth, height: node.offsetHeight });
			}

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
				? calculatePosition(anchor, cardSize, currentStep?.placement)
				: null;

		const lastPosRef = React.useRef<{
			left: number;
			top: number;
			side: string;
		} | null>(null);

		if (activePos) {
			lastPosRef.current = activePos;
		}

		const pos = activePos || lastPosRef.current;
		const placementStr = currentStep?.placement || "bottom-center";
		const side = pos?.side || placementStr.split("-")[0] || "bottom";

		let arrowStyle: React.CSSProperties = { display: "none" };
		if (anchor && activePos && !isWaiting) {
			const arrowSize = 14;
			const offset = arrowSize / 2;
			let relativeX = anchor.left + anchor.width / 2 - activePos.left;
			let relativeY = anchor.top + anchor.height / 2 - activePos.top;

			relativeX = Math.max(20, Math.min(relativeX, cardSize.width - 20));
			relativeY = Math.max(20, Math.min(relativeY, cardSize.height - 20));

			arrowStyle = {
				position: "absolute",
				width: arrowSize,
				height: arrowSize,
				backgroundColor: "inherit",
				borderWidth: 1,
				borderStyle: "solid",
				borderColor: "inherit",
				transform: "rotate(45deg)",
				zIndex: -1,
				pointerEvents: "none",
			};

			if (side === "bottom") {
				arrowStyle.top = -offset;
				arrowStyle.left = relativeX - offset;
				arrowStyle.borderBottomWidth = 0;
				arrowStyle.borderRightWidth = 0;
			} else if (side === "top") {
				arrowStyle.bottom = -offset;
				arrowStyle.left = relativeX - offset;
				arrowStyle.borderTopWidth = 0;
				arrowStyle.borderLeftWidth = 0;
			} else if (side === "right") {
				arrowStyle.left = -offset;
				arrowStyle.top = relativeY - offset;
				arrowStyle.borderTopWidth = 0;
				arrowStyle.borderRightWidth = 0;
			} else if (side === "left") {
				arrowStyle.right = -offset;
				arrowStyle.top = relativeY - offset;
				arrowStyle.borderBottomWidth = 0;
				arrowStyle.borderLeftWidth = 0;
			}
		}

		const mergedRef = React.useCallback(
			(node: HTMLDivElement | null) => {
				innerRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref && "current" in ref) {
					(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
				}
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
			if (isTransitioning) {
				const t = setTimeout(
					() => setIsTransitioning(false),
					skipAnimation ? 0 : TOUR_ANIMATION_DURATION,
				);
				return () => clearTimeout(t);
			}
		}, [isTransitioning, skipAnimation]);

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
					data-state={isWaiting ? "waiting" : "found"}
					data-side={side}
					data-open={!isAnimatingExit}
					{...props}
					style={{
						position: "fixed",
						zIndex: 9999,
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
							: {
									bottom: "24px",
									right: "24px",
								}),
						...style,
					}}
				>
					{children}
				</Comp>
			</CardContext.Provider>,
			document.body,
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
		return <Comp ref={ref} style={{ ...arrowStyle, ...style }} {...props} />;
	},
);
Arrow.displayName = "Tour.Arrow";

export interface TourButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

export const NextButton = React.forwardRef<HTMLButtonElement, TourButtonProps>(
	({ onClick, asChild, ...props }, ref) => {
		const { next } = useTourContext();
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
					next();
					onClick?.(e);
				}}
				{...props}
			/>
		);
	},
);

NextButton.displayName = "Tour.NextButton";

export const PreviousButton = React.forwardRef<
	HTMLButtonElement,
	TourButtonProps
>(({ onClick, asChild, ...props }, ref) => {
	const { previous, currentStepIndex } = useTourContext();
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			ref={ref}
			onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
				previous();
				onClick?.(e);
			}}
			disabled={currentStepIndex === 0}
			{...props}
		/>
	);
});

PreviousButton.displayName = "Tour.PreviousButton";

export const CloseButton = React.forwardRef<HTMLButtonElement, TourButtonProps>(
	({ onClick, asChild, ...props }, ref) => {
		const { close } = useTourContext();
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
					close();
					onClick?.(e);
				}}
				{...props}
			/>
		);
	},
);

CloseButton.displayName = "Tour.CloseButton";
