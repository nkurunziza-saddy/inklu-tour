"use client";

import * as React from "react";
import { useTour } from "./provider";

export interface TourSettingsMorphProps {
	className?: string;
	style?: React.CSSProperties;
}

export function TourSettingsMorph({ className, style }: TourSettingsMorphProps) {
	const { options, updateOptions } = useTour();
	const [open, setOpen] = React.useState(false);
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div
			ref={ref}
			className={`t-morph ${className ?? ""}`}
			data-open={open ? "true" : "false"}
			style={style}
		>
			<div className="t-morph-menu" role="dialog" aria-label="Tour Settings">
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: "4px",
						fontWeight: 600,
						fontSize: "14px",
					}}
				>
					<span>Tour Settings</span>
					<button
						type="button"
						onClick={() => setOpen(false)}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "var(--tour-muted, #71717a)",
							fontSize: "16px",
							lineHeight: 1,
							padding: "2px",
						}}
					>
						✕
					</button>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "10px",
						overflowY: "auto",
					}}
				>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							cursor: "pointer",
							userSelect: "none",
						}}
					>
						<span>Press outside to close</span>
						<input
							type="checkbox"
							checked={options.closeOnOutsideClick ?? false}
							onChange={(e) =>
								updateOptions({ closeOnOutsideClick: e.target.checked })
							}
							style={{ accentColor: "var(--tour-accent, #18181b)" }}
						/>
					</label>

					<label
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							cursor: "pointer",
							userSelect: "none",
						}}
					>
						<span>Click overlay to close</span>
						<input
							type="checkbox"
							checked={options.closeOnOverlayClick ?? false}
							onChange={(e) =>
								updateOptions({ closeOnOverlayClick: e.target.checked })
							}
							style={{ accentColor: "var(--tour-accent, #18181b)" }}
						/>
					</label>

					<label
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							cursor: "pointer",
							userSelect: "none",
						}}
					>
						<span>Show Spotlight</span>
						<input
							type="checkbox"
							checked={options.showSpotlight ?? true}
							onChange={(e) =>
								updateOptions({ showSpotlight: e.target.checked })
							}
							style={{ accentColor: "var(--tour-accent, #18181b)" }}
						/>
					</label>

					<label
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							cursor: "pointer",
							userSelect: "none",
						}}
					>
						<span>Keyboard Navigation</span>
						<input
							type="checkbox"
							checked={options.keyboardNavigation ?? true}
							onChange={(e) =>
								updateOptions({ keyboardNavigation: e.target.checked })
							}
							style={{ accentColor: "var(--tour-accent, #18181b)" }}
						/>
					</label>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "4px",
							marginTop: "4px",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "12px",
								color: "var(--tour-muted, #71717a)",
							}}
						>
							<span>Spotlight Padding</span>
							<span>{options.spotlightPadding ?? 8}px</span>
						</div>
						<input
							type="range"
							min="0"
							max="24"
							value={options.spotlightPadding ?? 8}
							onChange={(e) =>
								updateOptions({ spotlightPadding: Number(e.target.value) })
							}
							style={{ width: "100%", accentColor: "var(--tour-accent, #18181b)" }}
						/>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "4px",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "12px",
								color: "var(--tour-muted, #71717a)",
							}}
						>
							<span>Overlay Dimness</span>
							<span>{Math.round((options.maskOpacity ?? 0.6) * 100)}%</span>
						</div>
						<input
							type="range"
							min="0.1"
							max="0.9"
							step="0.05"
							value={options.maskOpacity ?? 0.6}
							onChange={(e) =>
								updateOptions({ maskOpacity: Number(e.target.value) })
							}
							style={{ width: "100%", accentColor: "var(--tour-accent, #18181b)" }}
						/>
					</div>
				</div>
			</div>

			<button
				type="button"
				className="t-morph-plus"
				aria-expanded={open ? "true" : "false"}
				aria-label="Tour Settings Menu"
				onClick={(e) => {
					e.stopPropagation();
					setOpen((v) => !v);
				}}
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path
						d="M10 4V16M4 10H16"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
					/>
				</svg>
			</button>
		</div>
	);
}
