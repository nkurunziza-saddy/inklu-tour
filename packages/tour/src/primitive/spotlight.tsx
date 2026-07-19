import * as React from "react";
import { createPortal } from "react-dom";
import { TOUR_ANIMATION_DURATION, useTourContext } from "./context";

export function Spotlight({
	className,
	padding = 8,
	style,
	fill = "black",
	maskOpacity = 0.55,
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
	const { rects, isWaiting, currentStep } = useTourContext();
	const [mounted, setMounted] = React.useState(false);
	const [isTransitioning, setIsTransitioning] = React.useState(false);
	const prevStepId = React.useRef(currentStep?.id);

	if (currentStep?.id !== prevStepId.current) {
		setIsTransitioning(true);
		prevStepId.current = currentStep?.id;
	}

	React.useEffect(() => setMounted(true), []);

	React.useEffect(() => {
		if (isTransitioning) {
			const t = setTimeout(
				() => setIsTransitioning(false),
				TOUR_ANIMATION_DURATION,
			);
			return () => clearTimeout(t);
		}
	}, [isTransitioning]);

	if (!mounted) return null;

	const transitionStyle = isTransitioning
		? `all ${TOUR_ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
		: "none";

	return createPortal(
		<svg
			className={className}
			style={{
				position: "fixed",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex: 9998,
				opacity: isWaiting ? 0 : 1,
				transition: `opacity ${TOUR_ANIMATION_DURATION}ms`,
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
							key={`mask-${i}`}
							x={r.left - padding}
							y={r.top - padding}
							width={r.width + padding * 2}
							height={r.height + padding * 2}
							rx={r.radius + 4}
							fill="black"
							style={{ transition: transitionStyle }}
						/>
					))}
				</mask>
			</defs>
			<rect
				width="100%"
				height="100%"
				fill={fill}
				opacity={maskOpacity}
				mask="url(#tour-spotlight-mask)"
			/>
			{rects.map((r, i) => (
				<rect
					key={`ring-${i}`}
					x={r.left - padding}
					y={r.top - padding}
					width={r.width + padding * 2}
					height={r.height + padding * 2}
					rx={r.radius + 4}
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
