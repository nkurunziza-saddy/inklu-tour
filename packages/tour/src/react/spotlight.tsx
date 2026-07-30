import * as React from "react";
import { createPortal } from "react-dom";
import { TOUR_ANIMATION_DURATION } from "../core/constants";
import { useTourContext } from "./context";

export function Spotlight({
	className,
	padding: propPadding,
	style,
	fill = "black",
	maskOpacity: propMaskOpacity,
	stroke = "currentColor",
	strokeWidth = 2,
	strokeOpacity = 0.8,
	...props
}: React.SVGProps<SVGSVGElement> & {
	padding?: number;
	fill?: string;
	maskOpacity?: number;
	stroke?: string;
	strokeWidth?: number | string;
	strokeOpacity?: number;
}) {
	const context = useTourContext();
	const {
		rects,
		isWaiting,
		currentStep,
		skipAnimation,
		isAnimatingExit,
		reducedMotion,
		close,
	} = context;

	const showSpotlight = context.config.showSpotlight ?? true;
	const padding = propPadding ?? context.config.spotlightPadding ?? 8;
	const maskOpacity = propMaskOpacity ?? context.config.maskOpacity ?? 0.6;
	const closeOnOverlayClick = context.config.closeOnOverlayClick ?? false;

	const spotlightRadius = context.config.spotlightRadius;
	const targetPulse = context.config.targetPulse ?? false;

	const [mounted, setMounted] = React.useState(false);
	const [isTransitioning, setIsTransitioning] = React.useState(false);
	const prevStepId = React.useRef(currentStep?.id);

	if (currentStep?.id !== prevStepId.current) {
		setIsTransitioning(!skipAnimation);
		prevStepId.current = currentStep?.id;
	}

	React.useEffect(() => setMounted(true), []);

	React.useEffect(() => {
		if (isTransitioning) {
			const t = setTimeout(
				() => setIsTransitioning(false),
				skipAnimation ? 0 : TOUR_ANIMATION_DURATION,
			);
			return () => clearTimeout(t);
		}
	}, [isTransitioning, skipAnimation]);

	if (!mounted || !showSpotlight) return null;

	const transitionDuration = skipAnimation ? 0 : TOUR_ANIMATION_DURATION;
	const transitionStyle =
		isTransitioning && !reducedMotion
			? `x ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1), y ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1), width ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1), height ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1), rx ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
			: "none";

	return createPortal(
		<svg
			className={className}
			style={{
				position: "fixed",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: closeOnOverlayClick ? "auto" : "none",
				zIndex: 9998,
				opacity: isWaiting || isAnimatingExit ? 0 : 1,
				transition: `opacity ${isAnimatingExit ? 150 : transitionDuration}ms ease-out`,
				...style,
			}}
			data-state={isWaiting ? "waiting" : "found"}
			{...props}
		>
			<defs>
				<mask id="tour-spotlight-mask">
					<rect width="100%" height="100%" fill="white" />
					{rects.map((r, i) => (
						<rect
							// biome-ignore lint/suspicious/noArrayIndexKey: Rect order is stable
							key={`mask-${i}`}
							x={r.left - padding}
							y={r.top - padding}
							width={r.width + padding * 2}
							height={r.height + padding * 2}
							rx={spotlightRadius ?? r.radius + 4}
							fill="black"
							style={{ transition: transitionStyle }}
						/>
					))}
				</mask>
			</defs>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: Overlay mask click */}
			<rect
				width="100%"
				height="100%"
				fill={fill}
				opacity={maskOpacity}
				mask="url(#tour-spotlight-mask)"
				style={{
					pointerEvents: closeOnOverlayClick ? "auto" : "none",
					cursor: closeOnOverlayClick ? "pointer" : "default",
				}}
				onClick={() => {
					if (closeOnOverlayClick) close();
				}}
			/>
			{rects.map((r, i) => (
				<rect
					// biome-ignore lint/suspicious/noArrayIndexKey: Rect order is stable
					key={`ring-${i}`}
					className={targetPulse ? "inklu-tour-target-pulse" : undefined}
					x={r.left - padding}
					y={r.top - padding}
					width={r.width + padding * 2}
					height={r.height + padding * 2}
					rx={spotlightRadius ?? r.radius + 4}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
					opacity={strokeOpacity}
					style={{ transition: transitionStyle }}
				/>
			))}
		</svg>,
		document.body,
	);
}

Spotlight.displayName = "Tour.Spotlight";
