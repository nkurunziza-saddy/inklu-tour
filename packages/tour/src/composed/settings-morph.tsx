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
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="4" y1="21" x2="4" y2="14" />
					<line x1="4" y1="10" x2="4" y2="3" />
					<line x1="12" y1="21" x2="12" y2="12" />
					<line x1="12" y1="8" x2="12" y2="3" />
					<line x1="20" y1="21" x2="20" y2="16" />
					<line x1="20" y1="12" x2="20" y2="3" />
					<line x1="1" y1="14" x2="7" y2="14" />
					<line x1="9" y1="8" x2="15" y2="8" />
					<line x1="17" y1="16" x2="23" y2="16" />
				</svg>
			</button>
		</div>
	);
}
