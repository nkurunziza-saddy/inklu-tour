# API Reference

Complete API reference for `@inklu/tour`.

## Composed API (`@inklu/tour`)

The default import gives you a batteries-included tour with zero UI work.

### TourProvider

Wrap your app with `TourProvider` to enable tours. It manages all state (active tour, step index, open/close) and renders the styled tour card + spotlight automatically.

| Prop | Type | Description |
| ------------ | ------------------------------- | ------------------------------------------------------------------- |
| `tours` | `TourConfig[]` | Array of tour configurations. |
| `onNavigate` | `(route: string) => void` | Called when a step with a `route` property becomes active. Wire your router here (e.g. `router.push`). |
| `children` | `React.ReactNode` | Content to wrap with the tour context. |

### useTour

Hook to control tours from anywhere inside `<TourProvider>`.

| Property | Type | Description |
| -------------- | --------------------------- | ------------------------------------------------ |
| `startTour` | `(tourId: string) => void` | Start a specific tour by its ID. |
| `stopTour` | `() => void` | Close the currently active tour. |
| `activeTourId` | `string \| null` | The ID of the currently active tour, or `null`. |
| `isActive` | `boolean` | Whether a tour is currently open. |

---

## Configuration Types

### TourConfig

| Property | Type | Description |
| -------- | ------------ | ------------------------------- |
| `id` | `string` | Unique identifier for the tour. |
| `steps` | `TourStep[]` | Array of steps in the tour. |

### TourStep

| Property | Type | Description |
| ----------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `id` | `string` | Unique identifier. Used to match `data-tour-step` attributes when `target` is omitted. |
| `target` | `string \| TourTargetConfig` | CSS selector or a config object for lazy-loaded elements. Defaults to `[data-tour-step="id"]` if omitted. |
| `placement` | `string` | Preferred placement (`"top-center"`, `"bottom-end"`, etc.). Defaults to `"bottom-center"`. Auto-flips when space is limited. |
| `route` | `string` | Route to navigate to when this step becomes active. |
| `meta` | `Record<string, any>` | Metadata for the UI. The composed card reads `meta.title` and `meta.content`. |

### TourTargetConfig

| Property | Type | Default | Description |
| ---------- | -------------------------------- | ------- | -------------------------------------------------------- |
| `selector` | `string` | — | CSS selector to target. |
| `timeout` | `number` | `5000` | Milliseconds to wait for the element before timing out. |
| `strategy` | `"wait" \| "skip" \| "error"` | `"wait"` | Behavior when the element isn't found within the timeout. |

---

## Behavior

- **Keyboard**: `Esc` closes the tour. `→` advances and `←` goes back.
- **Scrolling**: If a step's target is outside the viewport, it is scrolled into view automatically.
- **Positioning**: The card anchors to the highlighted element; when no target exists, the card floats at the bottom-right over a dimmed overlay.
- **Motion**: The spotlight and card animate between steps with 300ms eased transitions. Both respect `prefers-reduced-motion`.
- **Dark mode**: Automatically adapts to `.dark` or `[data-theme="dark"]` on any ancestor. Fully customisable via `--tour-*` CSS variables.

---

## Primitive API (`@inklu/tour/primitive`)

For full control over the UI, import headless building blocks:

```tsx
import {
  TourRoot,
  TourCard,
  TourArrow,
  TourSpotlight,
  TourNextButton,
  TourPreviousButton,
  TourCloseButton,
  useTourContext,
  useTourTarget,
} from "@inklu/tour/primitive";
```

### TourRoot

Controlled root component that provides tour context to children.

| Prop | Type | Description |
| ----------------- | -------------------------------- | --------------------------------------------------- |
| `tour` | `TourConfig \| null` | Active tour config. |
| `open` | `boolean` | Whether the tour is visible. |
| `onOpenChange` | `(open: boolean) => void` | Called when open state should change. |
| `stepIndex` | `number` | Current step index (0-based). |
| `onStepChange` | `(index: number) => void` | Called when step should change. |
| `onComplete` | `() => void` | Called when the last step's "Next" is clicked. |
| `onDismiss` | `() => void` | Called when the tour is dismissed (Esc, close btn). |
| `onTargetWaiting` | `(stepId: string) => void` | Called when waiting for a target element to appear. |
| `onTargetFound` | `(stepId: string) => void` | Called when the target element is found. |
| `onTargetTimeout` | `(stepId: string) => void` | Called when target lookup times out. |

### TourCard

Portaled card container. Positions itself relative to the target element.

### TourArrow

Decorative arrow pointing from the card toward the target element.

### TourSpotlight

SVG overlay that dims the page and cuts out holes for target elements.

| Prop | Type | Default | Description |
| ------------- | -------- | ------------- | ---------------------------------- |
| `fill` | `string` | `"black"` | Overlay fill color. |
| `maskOpacity` | `number` | `0.55` | Overlay opacity. |
| `padding` | `number` | `8` | Padding around target cutouts. |
| `stroke` | `string` | `"currentColor"` | Ring color around targets. |
| `strokeWidth` | `number` | `2` | Ring stroke width. |
| `strokeOpacity` | `number` | `0.8` | Ring opacity. |

### TourNextButton / TourPreviousButton / TourCloseButton

Unstyled button primitives that wire up `next()`, `previous()`, and `close()` respectively. All support the `asChild` prop for custom rendering.

### useTourContext

Hook to access tour state from within `<TourRoot>`:

| Property | Type | Description |
| ------------------ | --------------------- | --------------------------------------------- |
| `tour` | `TourConfig \| null` | Current tour config. |
| `open` | `boolean` | Whether tour is visible. |
| `currentStepIndex` | `number` | Current step index. |
| `currentStep` | `TourStep \| null` | Current step object. |
| `totalSteps` | `number` | Total number of steps. |
| `isWaiting` | `boolean` | Whether waiting for a target element to appear. |
| `rects` | `Rect[]` | Bounding rects of target elements. |
| `next` | `() => void` | Advance to next step. |
| `previous` | `() => void` | Go to previous step. |
| `close` | `() => void` | Close the tour. |
| `setStep` | `(index: number) => void` | Jump to a specific step. |
