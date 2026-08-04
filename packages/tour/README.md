# @inklu/tour

Accessible, headless product tours for React. Spotlight overlay, resilient
target tracking, and full composition control.

- **Accessible by default** — the card is a real `dialog` with an accessible
  name and description, focus moves into it on open and returns on close, and
  step changes are announced through a live region.
- **Resilient targeting** — targets that don't exist yet are waited for, with
  per-step `wait` / `skip` / `error` strategies.
- **Headless or batteries-included** — drop in `<TourProvider>`, or compose
  `TourRoot` / `TourSpotlight` / `TourCard` yourself.
- **Server-friendly** — the React entry ships the `"use client"` directive, and
  the core entry is DOM-free until you call into it.

## Install

```sh
npm install @inklu/tour
```

`react` and `react-dom` (18 or 19) are peer dependencies.

## Quick start

```tsx
import { TourProvider, useTour, type TourConfig } from "@inklu/tour/react";

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
        target: '[data-tour-step="compose"]',
        placement: "bottom-start",
        meta: { title: "Compose", content: <em>Start writing.</em> },
      },
    ],
  },
];

export function App({ children }: { children: React.ReactNode }) {
  return <TourProvider tours={tours}>{children}</TourProvider>;
}

function StartButton() {
  const { startTour } = useTour();
  return <button onClick={() => startTour("onboarding")}>Take a tour</button>;
}
```

Any element can be targeted by CSS selector, or by tagging it with
`data-tour-step="<step id>"` and omitting `target`.

## Steps

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Required. Doubles as the `data-tour-step` lookup when `target` is omitted. |
| `target` | `string \| TourTargetConfig` | CSS selector, or `{ selector, timeout, strategy }`. |
| `placement` | `Placement` | `"top" \| "bottom" \| "left" \| "right"`, optionally suffixed `-start` / `-center` / `-end`. Flips automatically when there isn't room. |
| `route` | `string` | Passed to `onNavigate` before the step becomes active. |
| `meta` | `{ title?, content?, ... }` | `title` and `content` accept any `ReactNode`. |

### Target strategies

When a target isn't in the DOM yet, the tour waits for it and shows a spinner.

- `wait` (default) — keep waiting indefinitely.
- `skip` — advance to the next step once `timeout` elapses.
- `error` — report through `onError` (never thrown, since it originates in a
  timer) and stay put.

```tsx
{ id: "modal", target: { selector: "#modal", timeout: 3000, strategy: "skip" } }
```

## Configuration

Pass `config` to `<TourProvider>`, per tour, or per `<TourRoot>` — later wins.

| Option | Default | Notes |
| --- | --- | --- |
| `showSpotlight` | `true` | Render the mask overlay. |
| `spotlightPadding` | `8` | Padding around the cutout, in px. |
| `spotlightRadius` | target radius + 4 | Corner radius override. |
| `maskOpacity` | `0.6` | Backdrop darkness. |
| `targetPulse` | `false` | Pulse the highlight ring. |
| `cardOffset` | `16` | Gap between target and card. |
| `showArrow` | `true` | Directional arrow on the card. |
| `autoScroll` | `true` | Scroll the target into view. Uses instant scrolling under `prefers-reduced-motion`. |
| `keyboardNavigation` | `true` | Arrow keys step through the tour. |
| `dismissOnEscape` | `true` | Escape closes. |
| `closeOnOutsideClick` | `false` | Pointer down outside the card closes. |
| `closeOnOverlayClick` | `false` | Clicking the backdrop closes. |
| `zIndex` | `9998` | Spotlight sits here, card at `zIndex + 1`. |
| `autoFocus` | `true` | Move focus to the card on open. |
| `restoreFocus` | `true` | Return focus to the previously focused element on close. |
| `trapFocus` | `false` | Confine Tab to the card and set `aria-modal`. Off by default so the highlighted element stays reachable. |
| `announceSteps` | `true` | Announce step changes in a live region. |
| `labels` | — | `next`, `previous`, `finish`, `close`, and `stepCounter(current, total)`. |

## Accessibility notes

The card renders as `role="dialog"` labelled by the step title and described by
the step content. It is **not** `aria-modal` unless you opt into `trapFocus`,
because a tour usually wants the user to interact with the element it is
pointing at — claiming modality while the rest of the page stays operable
misrepresents the UI to screen readers.

Because focus stays where the user put it as they step through, a polite live
region carries the announcement instead. Arrow-key shortcuts are ignored when
the event comes from an input, textarea, select, or contenteditable, so typing
is never hijacked.

## Composition

`<TourProvider>` renders a default card. For full control, compose the parts:

```tsx
import {
  TourRoot,
  TourSpotlight,
  TourCard,
  TourArrow,
  TourNextButton,
  TourPreviousButton,
  TourCloseButton,
  useTourContext,
} from "@inklu/tour/react";

function MyTour(props) {
  return (
    <TourRoot {...props}>
      <TourSpotlight />
      <TourCard className="my-card">
        <TourArrow />
        <Body />
      </TourCard>
    </TourRoot>
  );
}

function Body() {
  const { currentStep, currentStepIndex, totalSteps, labelId, descriptionId } =
    useTourContext();
  return (
    <>
      <h2 id={labelId}>{currentStep?.meta?.title}</h2>
      <div id={descriptionId}>{currentStep?.meta?.content}</div>
      <TourPreviousButton>Back</TourPreviousButton>
      <TourNextButton>
        {currentStepIndex === totalSteps - 1 ? "Done" : "Next"}
      </TourNextButton>
      <TourCloseButton>Dismiss</TourCloseButton>
    </>
  );
}
```

Wire `labelId` / `descriptionId` to your title and content so the dialog keeps
its accessible name and description. Every button accepts `asChild` to render
your own component instead.

## Routing

Steps with a `route` call `onNavigate` before becoming active:

```tsx
<TourProvider tours={tours} onNavigate={(route) => router.push(route)}>
```

## Sound (optional)

Install [`@inklu/audio`](https://www.npmjs.com/package/@inklu/audio) and set
`enableAudio`. It is an optional peer dependency loaded on demand, so consumers
who don't opt in never pay for it:

```tsx
<TourProvider tours={tours} enableAudio>
```

Buttons carry `data-sound-click` hooks (`turn:forward`, `turn:backward`,
`close`) which you can override per button.

## Using this with a coding agent

An agent skill ships alongside the library at `skills/inklu-tour`. It walks a
coding agent through building a tour correctly — targeting, routing, the
accessibility wiring, and the mistakes that are easy to make — and carries a
full API reference. Install it via [skills.sh](https://skills.sh):

```sh
npx skills add nkurunziza-saddy/inklu-tour
```

## Framework-agnostic core

`@inklu/tour` (the root entry) exports the engine, target tracker, and geometry
helpers with no React dependency, for building your own adapter:

```ts
import { TourEngine, TargetTracker, calculatePosition } from "@inklu/tour";
```

## License

MIT
