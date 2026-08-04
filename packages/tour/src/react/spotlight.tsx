"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { TOUR_ANIMATION_DURATION } from "../core/constants";
import { useTourContext } from "./context";
import { useIsMounted } from "./utils";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export interface TourSpotlightProps extends React.SVGProps<SVGSVGElement> {
	padding?: number;
	fill?: string;
	maskOpacity?: number;
	stroke?: string;
	strokeWidth?: number | string;
	strokeOpacity?: number;
}

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
}: TourSpotlightProps) {
	const context = useTourContext();
	const {
		rects,
		isWaiting,
		currentStep,
		skipAnimation,
		isAnimatingExit,
		reducedMotion,
		container,
		config,
		close,
	} = context;

	const showSpotlight = config.showSpotlight ?? true;
	const padding = propPadding ?? config.spotlightPadding ?? 8;
	const maskOpacity = propMaskOpacity ?? config.maskOpacity ?? 0.6;
	const closeOnOverlayClick = config.closeOnOverlayClick ?? false;
	const spotlightRadius = config.spotlightRadius;
	const targetPulse = config.targetPulse ?? false;
	const zIndex = config.zIndex ?? 9998;

	// Scoped per instance: a hard-coded id collides when two tours (or two
	// Spotlights) are mounted, and the second mask silently wins.
	const maskId = `inklu-tour-mask-${React.useId().replace(/[:]/g, "")}`;

	const mounted = useIsMounted();
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

	if (!mounted || !showSpotlight) return null;

	const duration = skipAnimation ? 0 : TOUR_ANIMATION_DURATION;
	const transitionStyle =
		isTransitioning && !reducedMotion
			? ["x", "y", "width", "height", "rx"]
					.map((prop) => `${prop} ${duration}ms ${EASE}`)
					.join(", ")
			: "none";

	// Keyed by index on purpose: the rects keep their order across updates, and
	// reusing the same <rect> nodes is what lets the CSS transition animate the
	// cutout from one target to the next instead of snapping.
	const cutouts = rects.map((r, i) => ({
		key: i,
		x: r.left - padding,
		y: r.top - padding,
		width: r.width + padding * 2,
		height: r.height + padding * 2,
		rx: spotlightRadius ?? r.radius + 4,
	}));

	return createPortal(
		<svg
			className={className}
			aria-hidden="true"
			focusable="false"
			style={{
				position: "fixed",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex,
				opacity: isWaiting || isAnimatingExit ? 0 : 1,
				transition: `opacity ${isAnimatingExit ? 150 : duration}ms ease-out`,
				...style,
			}}
			data-state={isWaiting ? "waiting" : "found"}
			{...props}
		>
			<defs>
				<mask id={maskId}>
					<rect width="100%" height="100%" fill="white" />
					{cutouts.map((c) => (
						<rect
							key={`mask-${c.key}`}
							x={c.x}
							y={c.y}
							width={c.width}
							height={c.height}
							rx={c.rx}
							fill="black"
							style={{ transition: transitionStyle }}
						/>
					))}
				</mask>
			</defs>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: decorative overlay; Escape and the close button are the accessible paths */}
			<rect
				width="100%"
				height="100%"
				fill={fill}
				opacity={maskOpacity}
				mask={`url(#${maskId})`}
				style={{
					pointerEvents: closeOnOverlayClick ? "auto" : "none",
					cursor: closeOnOverlayClick ? "pointer" : "default",
				}}
				onClick={closeOnOverlayClick ? () => close() : undefined}
			/>
			{cutouts.map((c) => (
				<rect
					key={`ring-${c.key}`}
					className={targetPulse ? "inklu-tour-target-pulse" : undefined}
					x={c.x}
					y={c.y}
					width={c.width}
					height={c.height}
					rx={c.rx}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
					opacity={strokeOpacity}
					style={{ transition: transitionStyle }}
				/>
			))}
		</svg>,
		container ?? document.body,
	);
}

Spotlight.displayName = "Tour.Spotlight";
