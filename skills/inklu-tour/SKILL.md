---
name: inklu-tour
description: Build accessible product tours, onboarding walkthroughs, feature spotlights, and guided coach-marks in React with @inklu/tour. Use when adding or debugging a product tour, onboarding flow, or step-by-step UI walkthrough, when working with TourProvider, useTour, TourRoot, TourCard, TourSpotlight, or data-tour-step, or when a tour's target is missing, mispositioned, or not announced to screen readers.
---

# Building product tours with @inklu/tour

`@inklu/tour` is a headless React tour library: it tracks DOM targets, positions
a card against them, paints a spotlight cutout, and manages focus and keyboard
behaviour. You supply the content and, if you want, the entire UI.

Work through the steps in order. Do not skip step 6 — the accessibility wiring
is the part that is most often silently wrong.

## Step 1 — Install and pick an entry point

```sh
npm install @inklu/tour     # react and react-dom 18/19 are peer deps
```

| Import from | Contains | Use when |
| --- | --- | --- |
| `@inklu/tour/react` | All components and hooks | Building UI. **This is what you want.** |
| `@inklu/tour` | `TourEngine`, `TargetTracker`, geometry helpers. No React. | Writing an adapter for another framework. |

The React entry already carries `"use client"`. In Next.js App Router you can
import it directly from a client component with no extra wrapper.

## Step 2 — Define the tours

Type the array. `meta.title` and `meta.content` accept any `ReactNode`.

```tsx
import type { TourConfig } from "@inklu/tour/react";

const tours: TourConfig[] = [
  {
    id: "onboarding",
    steps: [
      {
        id: "sidebar",
        target: "#sidebar",
        placement: "right",
        meta: { title: "Your workspace", content: "Everything lives here." },
      },
      {
        id: "compose",
        placement: "bottom-start",
        meta: { title: "Compose", content: <em>Start writing.</em> },
      },
    ],
  },
];
```

`placement` is `"top" | "bottom" | "left" | "right"`, optionally suffixed
`-start` / `-center` / `-end`. A bare side means `-center`. The card flips to
the opposite side automatically when there isn't room, so pick the placement you
want in the common case and let it adapt.

Defining `tours` inline in JSX is safe — the engine only re-tracks when a step's
resolved target actually changes, not when the array identity does.

## Step 3 — Choose how each step finds its element

Two options. **Prefer the data attribute.**

```tsx
// Preferred: tag the element. Survives refactors of class names and structure.
<button data-tour-step="compose">Publish</button>
// ...and omit `target` in the step; the step id is used as the lookup.

// Alternative: a CSS selector, when you can't edit the target's markup.
{ id: "sidebar", target: "#sidebar" }
```

For elements that appear asynchronously, use the object form:

```tsx
{ id: "modal", target: { selector: "#modal", timeout: 3000, strategy: "skip" } }
```

| Strategy | Behaviour on timeout | Choose when |
| --- | --- | --- |
| `"wait"` (default) | Keeps waiting forever, showing a spinner | The element is guaranteed to arrive |
| `"skip"` | Advances to the next step | The step is optional / conditional UI |
| `"error"` | Calls `onError`, stays put | A missing target is a bug you want reported |

`"error"` **never throws** — the timeout fires inside a timer callback where no
`try/catch` of yours could catch it. Handle it with `onError`.

## Step 4 — Mount the provider

Wrap the app or the relevant subtree once.

```tsx
"use client";

import { TourProvider } from "@inklu/tour/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider tours={tours} onError={(e) => reportError(e)}>
      {children}
    </TourProvider>
  );
}
```

The provider must be an ancestor of every component that calls `useTour()`, and
it renders the tour UI itself — you do not place a `<Tour>` anywhere.

## Step 5 — Start tours

```tsx
const { startTour, stopTour, goToStep, stepIndex, isActive, activeTourId,
        config, updateConfig } = useTour();

<button onClick={() => startTour("onboarding")}>Take a tour</button>;
```

`startTour` with an unregistered id warns and does nothing rather than opening
an empty tour. `updateConfig(partial)` changes options on a running tour.

To run a tour automatically on first visit, gate it on your own persisted flag:

```tsx
useEffect(() => {
  if (localStorage.getItem("onboarded")) return;
  startTour("onboarding");
  localStorage.setItem("onboarded", "1");
}, [startTour]);
```

## Step 6 — Accessibility (do not skip)

The defaults are correct. Two things can break them:

**If you build a custom card, wire the ids.** `useTourContext()` gives you
`labelId` and `descriptionId`. Without them the dialog has no accessible name
or description:

```tsx
const { currentStep, labelId, descriptionId } = useTourContext();

<h2 id={labelId}>{currentStep?.meta?.title}</h2>
<div id={descriptionId}>{currentStep?.meta?.content}</div>
```

**Do not turn on `trapFocus` reflexively.** It is off by default on purpose. A
tour normally wants the user to interact with the element it is pointing at;
trapping focus (and the `aria-modal` it sets) tells screen readers the rest of
the page is inert when it isn't. Only enable it for a tour that genuinely
blocks the UI.

Because focus deliberately stays where the user put it, step changes are
announced through a polite live region instead. Leave `announceSteps` on.

Put real text in `meta.title` — it is both the dialog's accessible name and the
announcement. A `title` that is a JSX element still renders, but only string
titles are announced.

## Step 7 — Style it

The default card is styled with CSS custom properties that inherit from common
design-token names, so it usually adopts your theme with no work:

```css
:root {
  --tour-bg: var(--popover);
  --tour-fg: var(--popover-foreground);
  --tour-accent: var(--primary);
  --tour-radius: 12px;
  --tour-width: 320px;
}
```

Override the classes (`.inklu-tour-card`, `.inklu-tour-btn-next`,
`.inklu-tour-title`, …) for finer control, or replace the UI entirely — see
`references/recipes.md`.

If the tour renders behind other fixed elements, raise `zIndex` (the spotlight
sits at `zIndex`, the card at `zIndex + 1`). If it must render inside a specific
subtree, pass `container`.

## Step 8 — Multi-page tours

Steps can declare a `route`. The provider calls `onNavigate` as the step becomes
active; you drive the router:

```tsx
<TourProvider tours={tours} onNavigate={(route) => router.push(route)}>
```

Pair this with `strategy: "wait"` so the step waits for the new page's target to
mount.

## Common mistakes

- **Rendering `<TourRoot>` or `<Tour>` alongside `<TourProvider>`.** The
  provider already renders the tour UI. Those two are alternatives to it, for
  when you want to own `open` / `stepIndex` yourself — not additions.
- **Calling `useTourContext()` outside the card.** It only works inside
  `TourRoot`'s subtree. Elsewhere in the app, use `useTour()`.
- **Expecting `strategy: "error"` to throw.** It reports via `onError`.
- **Enabling audio without installing it.** `@inklu/audio` is an optional peer
  dependency and `enableAudio` defaults to `false`. Install the package, then
  set the prop; if it's missing you get a warning, not a crash.
- **Setting `trapFocus: true` "for accessibility".** See step 6.
- **Building a custom card without `labelId` / `descriptionId`.** See step 6.
- **Targeting an element that is `visibility: hidden` or smaller than 5px.**
  The tracker treats those as not-yet-rendered and keeps waiting.
- **Reaching for a wrapper `<div>` as the target** when the visible control is a
  child — the spotlight will cut out the wrapper's full box.

## Reference material

- `references/api.md` — every exported component, hook, type, and config option.
- `references/recipes.md` — custom cards, async targets, multi-page flows,
  testing tours, and controlled (provider-less) usage.

Read the relevant reference file before writing non-trivial custom UI rather
than guessing at the API surface.

## Verify before finishing

- [ ] Tour opens, advances, rewinds, and closes.
- [ ] Every step's target resolves — no step sits on the spinner.
- [ ] Card is `role="dialog"` with an accessible name matching the step title.
- [ ] Tab and Escape behave; arrow keys still move the caret inside inputs.
- [ ] Focus returns to the trigger after the tour closes.
- [ ] Works on a narrow viewport (the card flips and clamps to stay on screen).
- [ ] Nothing logs a `[@inklu/tour]` warning in the console.
