# @inklu/tour API reference

Everything below is exported from `@inklu/tour/react` unless noted.

## Types

### `TourConfig`

```ts
interface TourConfig {
  id: string;
  steps: TourStep[];
  config?: TourConfigOptions; // per-tour overrides
}
```

### `TourStep`

```ts
interface TourStep {
  id: string;                    // required; also the data-tour-step lookup
  target?: string | TourTargetConfig;
  placement?: Placement;
  route?: string;                // passed to onNavigate before the step activates
  meta?: TourStepMeta;
}

interface TourStepMeta {
  title?: React.ReactNode;
  content?: React.ReactNode;
  [key: string]: unknown;        // carry your own fields through
}
```

### `Placement`

```ts
type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";
type Placement = Side | `${Side}-${Align}`;
```

A bare side is equivalent to `${side}-center`. The card flips to the opposite
side when the preferred one can't fit and the opposite has more room.

### `TourTargetConfig`

```ts
interface TourTargetConfig {
  selector: string;
  timeout?: number;              // default 5000
  strategy?: "wait" | "skip" | "error";  // default "wait"
}
```

### `TourLabels`

```ts
interface TourLabels {
  next?: string;                 // "Next"
  previous?: string;             // "Prev"
  finish?: string;               // "Finish"
  close?: string;                // "Close tour"
  stepCounter?: (current: number, total: number) => string; // "1 of 5"
}
```

`stepCounter` receives 1-based `current`. It renders the visible counter and is
reused in the screen-reader announcement.

## `TourConfigOptions`

Set on `TourProvider`, on a `TourConfig`, or on `TourRoot`. Most specific wins.

### Behaviour

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `keyboardNavigation` | `boolean` | `true` | Arrow keys step. Ignored for events from inputs/textareas/selects/contenteditable, during IME composition, with modifier keys, or when already `defaultPrevented`. |
| `dismissOnEscape` | `boolean` | `true` | Escape closes. |
| `closeOnOutsideClick` | `boolean` | `false` | Pointer press outside the card closes. Attached on a 50 ms delay so the opening click doesn't close it. |
| `closeOnOverlayClick` | `boolean` | `false` | Clicking the backdrop closes. |
| `autoScroll` | `boolean` | `true` | Scrolls the target into view once per step. Uses `behavior: "auto"` under `prefers-reduced-motion`. Skipped when the target is already visible or taller than 80% of the viewport. |
| `labels` | `TourLabels` | — | See above. |

### Appearance

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `showSpotlight` | `boolean` | `true` | |
| `spotlightPadding` | `number` | `8` | Px around the cutout on each side. |
| `spotlightRadius` | `number` | target radius + 4 | Overrides the cutout corner radius. |
| `maskOpacity` | `number` | `0.6` | |
| `targetPulse` | `boolean` | `false` | Animates the ring's stroke opacity. |
| `cardOffset` | `number` | `16` | Gap between target and card. |
| `showArrow` | `boolean` | `true` | |
| `zIndex` | `number` | `9998` | Spotlight at `zIndex`, card at `zIndex + 1`. |

### Accessibility

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoFocus` | `boolean` | `true` | Focus the card once per opening, not per step. |
| `restoreFocus` | `boolean` | `true` | Returns focus to whatever was focused before the tour opened, if still connected. |
| `announceSteps` | `boolean` | `true` | Polite live region. Only string `meta.title` is announced. |
| `trapFocus` | `boolean` | `false` | Confines Tab and sets `aria-modal="true"`. Leave off unless the tour genuinely blocks the page. |

## Components

### `TourProvider`

```ts
interface TourProviderProps {
  tours: TourConfig[];
  onNavigate?: (route: string) => void;
  onError?: (error: Error) => void;
  enableAudio?: boolean;         // default false; needs @inklu/audio installed
  container?: Element | null;    // portal target; default document.body
  config?: TourConfigOptions;
  children: React.ReactNode;
}
```

Renders the built-in tour UI itself. Do not also render `Tour` or `TourRoot`.

### `useTour()`

```ts
interface UseTourReturn {
  startTour: (id: string) => void;   // warns and no-ops on an unknown id
  stopTour: () => void;
  goToStep: (index: number) => void;
  stepIndex: number;
  isActive: boolean;
  activeTourId: string | null;
  config: TourConfigOptions;
  updateConfig: (partial: Partial<TourConfigOptions>) => void;
}
```

Throws if called outside a `TourProvider`.

### `TourRoot`

Headless state host. Use *instead of* `TourProvider` when you own the whole UI.

```ts
interface TourRootProps {
  tour: TourConfig | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  stepIndex?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;       // fired when Next is pressed on the last step
  onDismiss?: () => void;        // fired when closed via Escape/close button
  onTargetWaiting?: (stepId: string) => void;
  onTargetFound?: (stepId: string) => void;
  onTargetTimeout?: (stepId: string) => void;
  onError?: (error: Error) => void;
  container?: Element | null;
  config?: TourConfigOptions;
  children?: React.ReactNode;
}
```

Fully controlled: it does not own `open` or `stepIndex`, so you must feed both
back from your own state.

### `Tour`

The batteries-included card and spotlight, taking the same props as `TourRoot`.
Use it when you want `TourRoot`'s controlled API but the default UI:

```tsx
<Tour tour={tour} open={open} onOpenChange={setOpen}
      stepIndex={step} onStepChange={setStep} />
```

### `useTourContext()`

Per-tour state. Only available to components rendered **inside** `TourRoot`
(i.e. your custom card). Components that are merely inside `TourProvider` are
not in that subtree — use `useTour()` there instead.

```ts
interface TourContextValue {
  tour: TourConfig | null;
  open: boolean;
  isAnimatingExit: boolean;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isWaiting: boolean;            // target not yet resolved
  rects: Rect[];                 // measured target rectangles
  rectsStepId: string | null;
  skipAnimation: boolean;
  reducedMotion: boolean;
  config: TourConfigOptions;
  labelId: string;               // put on your title element
  descriptionId: string;         // put on your content element
  container: Element | null;
  next: () => void;
  previous: () => void;
  close: () => void;
  setStep: (index: number) => void;
}
```

### `TourSpotlight`

```tsx
<TourSpotlight
  padding={8}
  fill="black"
  maskOpacity={0.6}
  stroke="currentColor"
  strokeWidth={2}
  strokeOpacity={0.8}
/>
```

Props override the equivalent config options. `aria-hidden` and pointer-events
transparent unless `closeOnOverlayClick` is on. The mask id is scoped per
instance, so several spotlights can coexist.

### `TourCard`, `TourArrow`

`TourCard` renders the positioned `role="dialog"`. It accepts every
`div` attribute plus `asChild`. `TourArrow` renders the directional arrow and
must be a child of `TourCard`.

### `TourNextButton`, `TourPreviousButton`, `TourCloseButton`

Standard `button` props plus `asChild`. `TourPreviousButton` is disabled on step
0 by default; pass `disabled` to override.

Your `onClick` runs **before** the built-in action, and calling
`preventDefault()` cancels it:

```tsx
<TourNextButton onClick={(e) => { if (!saved) e.preventDefault(); }}>
  Next
</TourNextButton>
```

Each carries a `data-sound-click` attribute (`turn:forward`, `turn:backward`,
`close`) which you can override.

### `TourSettingsMorph`

A prebuilt popover that live-edits the active config through `updateConfig`.
Mostly useful for demos and internal tooling.

## Core entry (`@inklu/tour`)

No React. Exports `TourEngine`, `TargetTracker`, `TOUR_ANIMATION_DURATION`,
`TOUR_EXIT_DURATION`, all the types above, and the geometry helpers `toRect`,
`rectsEqual`, `unionOf`, `calculatePosition`.

```ts
const engine = new TourEngine();
engine.setOptions({ onStepChange, onOpenChange, onComplete, onDismiss, onError });
const unsubscribe = engine.subscribe(() => render(engine.getState()));
engine.setProps(open, stepIndex, steps);   // call on every state change
engine.next(); engine.previous(); engine.close();
engine.destroy();                           // reusable afterwards
```

`setProps` is idempotent: it only re-tracks when the resolved target changes.
`destroy()` releases timers and listeners but leaves the instance usable, so a
StrictMode remount works.
