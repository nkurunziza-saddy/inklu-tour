let injected = false;

export function injectTourStyles() {
	if (injected || typeof document === "undefined") return;
	injected = true;

	const style = document.createElement("style");
	style.setAttribute("data-inklu-tour", "");
	style.textContent = TOUR_CSS;
	document.head.appendChild(style);
}

const TOUR_CSS = /* css */ `
/* ── Theme tokens ────────────────────────────────────────────────── */

:root {
  --tour-bg: var(--popover, #ffffff);
  --tour-fg: var(--popover-foreground, #09090b);
  --tour-muted: var(--muted-foreground, #71717a);
  --tour-border: var(--border, rgba(0, 0, 0, 0.08));
  --tour-accent: var(--primary, #18181b);
  --tour-accent-fg: var(--primary-foreground, #fafafa);
  --tour-secondary: var(--secondary, #f4f4f5);
  --tour-radius: 12px;
  --tour-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  --tour-width: 320px;
  --tour-open-dur: 250ms;
  --tour-close-dur: 150ms;
  --tour-scale-open: 1;
  --tour-scale-close: 0.96;
  --tour-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

.dark,
[data-theme="dark"] {
  --tour-bg: var(--popover, #18181b);
  --tour-fg: var(--popover-foreground, #fafafa);
  --tour-muted: var(--muted-foreground, #a1a1aa);
  --tour-border: var(--border, rgba(255, 255, 255, 0.1));
  --tour-accent: var(--primary, #fafafa);
  --tour-accent-fg: var(--primary-foreground, #18181b);
  --tour-secondary: var(--secondary, #27272a);
  --tour-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* ── Animations ──────────────────────────────────────────────────── */

@keyframes inklu-tour-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Card ────────────────────────────────────────────────────────── */

.inklu-tour-card {
  width: var(--tour-width);
  display: flex;
  flex-direction: column;
  border-radius: var(--tour-radius);
  background: var(--tour-bg);
  color: var(--tour-fg);
  border: 1px solid var(--tour-border);
  box-shadow: var(--tour-shadow);
  font-size: 13px;
  line-height: 1.5;
  outline: none;
  opacity: 0;
  scale: var(--tour-scale-close);
  transform: scale(var(--tour-scale-close));
  pointer-events: none;
  will-change: transform, scale, translate, opacity, width, height;
  transition:
    opacity   var(--tour-close-dur) var(--tour-ease),
    transform var(--tour-close-dur) var(--tour-ease),
    scale     var(--tour-close-dur) var(--tour-ease),
    width     var(--tour-open-dur)  var(--tour-ease),
    height    var(--tour-open-dur)  var(--tour-ease);
}

.inklu-tour-card[data-open="true"] {
  opacity: 1;
  scale: var(--tour-scale-open);
  transform: scale(var(--tour-scale-open));
  pointer-events: auto;
  transition:
    opacity   var(--tour-open-dur) var(--tour-ease),
    transform var(--tour-open-dur) var(--tour-ease),
    scale     var(--tour-open-dur) var(--tour-ease),
    width     var(--tour-open-dur) var(--tour-ease),
    height    var(--tour-open-dur) var(--tour-ease);
}

@starting-style {
  .inklu-tour-card[data-open="true"] {
    opacity: 0;
    scale: var(--tour-scale-close);
    transform: scale(var(--tour-scale-close)) translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .inklu-tour-card {
    transition: opacity 150ms ease-out !important;
  }
  .inklu-tour-card[data-open="true"] {
    transition: opacity 250ms ease-out !important;
  }
}

/* ── Body ────────────────────────────────────────────────────────── */

.inklu-tour-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
}

/* ── Header ──────────────────────────────────────────────────────── */

.inklu-tour-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inklu-tour-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.inklu-tour-step-counter {
  font-size: 12px;
  color: var(--tour-muted);
}

.inklu-tour-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--tour-fg);
  margin: 0;
}

/* ── Close button ────────────────────────────────────────────────── */

.inklu-tour-close {
  width: 24px;
  height: 24px;
  margin: -4px -4px 0 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--tour-muted);
  cursor: pointer;
  padding: 0;
  transition: color 150ms, transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.inklu-tour-close:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .inklu-tour-close:hover {
    color: var(--tour-fg);
  }
}



/* ── Content ─────────────────────────────────────────────────────── */

.inklu-tour-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--tour-muted);
}

.inklu-tour-content-wrapper {
  opacity: 1;
  filter: blur(0px);
  transition: opacity 150ms var(--tour-ease), filter 150ms var(--tour-ease);
}

@starting-style {
  .inklu-tour-content-wrapper {
    opacity: 0;
    filter: blur(2px);
  }
}

/* ── Footer ──────────────────────────────────────────────────────── */

.inklu-tour-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}

.inklu-tour-footer-left,
.inklu-tour-footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Previous button ─────────────────────────────────────────────── */

.inklu-tour-btn-prev {
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: var(--tour-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 150ms, transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.inklu-tour-btn-prev:active:not(:disabled) {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .inklu-tour-btn-prev:hover:not(:disabled) {
    color: var(--tour-fg);
  }
}

.inklu-tour-btn-prev:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ── Next / Finish button ────────────────────────────────────────── */

.inklu-tour-btn-next {
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  background: var(--tour-accent);
  color: var(--tour-accent-fg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: opacity 150ms, transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.inklu-tour-btn-next:active:not(:disabled) {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .inklu-tour-btn-next:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.inklu-tour-btn-next:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ── Spinner ─────────────────────────────────────────────────────── */

.inklu-tour-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--tour-accent-fg);
  border-top-color: transparent;
  border-radius: 50%;
  animation: inklu-tour-spin 600ms linear infinite;
}

/* ── Utilities ───────────────────────────────────────────────────── */

.inklu-tour-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;
