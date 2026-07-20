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
  --tour-bg: #ffffff;
  --tour-fg: #09090b;
  --tour-muted: #71717a;
  --tour-border: rgba(0, 0, 0, 0.08);
  --tour-accent: #18181b;
  --tour-accent-fg: #fafafa;
  --tour-secondary: #f4f4f5;
  --tour-radius: 12px;
  --tour-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  --tour-width: 320px;
}

.dark,
[data-theme="dark"] {
  --tour-bg: #18181b;
  --tour-fg: #fafafa;
  --tour-muted: #a1a1aa;
  --tour-border: rgba(255, 255, 255, 0.1);
  --tour-accent: #fafafa;
  --tour-accent-fg: #18181b;
  --tour-secondary: #27272a;
  --tour-shadow: 0 4px 24px rgba(0, 0, 0, 0.32), 0 1px 2px rgba(0, 0, 0, 0.16);
}

/* ── Animations ──────────────────────────────────────────────────── */

@keyframes inklu-tour-card-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

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
  animation: inklu-tour-card-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .inklu-tour-card {
    animation: none;
  }
}

/* ── Body ────────────────────────────────────────────────────────── */

.inklu-tour-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
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
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--tour-muted);
  opacity: 0.7;
}

.inklu-tour-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
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
  transition: color 150ms;
}

.inklu-tour-close:hover {
  color: var(--tour-fg);
}

/* ── Progress bar ────────────────────────────────────────────────── */

.inklu-tour-progress {
  height: 2px;
  width: 100%;
  background: var(--tour-secondary);
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 4px;
}

.inklu-tour-progress-fill {
  height: 100%;
  background: var(--tour-fg);
  transition: width 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── Content ─────────────────────────────────────────────────────── */

.inklu-tour-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--tour-muted);
}

/* ── Footer ──────────────────────────────────────────────────────── */

.inklu-tour-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
}

/* ── Previous button ─────────────────────────────────────────────── */

.inklu-tour-btn-prev {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: var(--tour-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 150ms;
}

.inklu-tour-btn-prev:hover:not(:disabled) {
  color: var(--tour-fg);
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
  gap: 4px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  background: var(--tour-accent);
  color: var(--tour-accent-fg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 150ms;
}

.inklu-tour-btn-next:hover:not(:disabled) {
  opacity: 0.9;
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
