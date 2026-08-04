# @inklu/tour recipes

## Controlled tour with the default UI

When you want to own `open` and `stepIndex` but keep the built-in card, use
`Tour` instead of `TourProvider`:

```tsx
const [open, setOpen] = React.useState(false);
const [step, setStep] = React.useState(0);

<Tour
  tour={tour}
  open={open}
  onOpenChange={setOpen}
  stepIndex={step}
  onStepChange={setStep}
  onComplete={() => markOnboarded()}
/>;
```

## Fully custom card

Swap `Tour` for `TourRoot` and supply the UI yourself. This replaces
`TourProvider` — don't render both.

```tsx
"use client";

import {
  TourRoot, TourSpotlight, TourCard, TourArrow,
  TourNextButton, TourPreviousButton, TourCloseButton,
  useTourContext, type TourConfig,
} from "@inklu/tour/react";
import * as React from "react";

export function Onboarding({ tour }: { tour: TourConfig }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  return (
    <>
      <button onClick={() => { setStep(0); setOpen(true); }}>Take a tour</button>
      <TourRoot
        tour={tour}
        open={open}
        onOpenChange={setOpen}
        stepIndex={step}
        onStepChange={setStep}
        onComplete={() => markOnboarded()}
      >
        <TourSpotlight />
        <TourCard className="rounded-xl border bg-white p-4 shadow-lg w-80">
          <TourArrow />
          <Body />
        </TourCard>
      </TourRoot>
    </>
  );
}

function Body() {
  const { currentStep, currentStepIndex, totalSteps, isWaiting,
          labelId, descriptionId } = useTourContext();
  if (!currentStep) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 id={labelId} className="font-medium">{currentStep.meta?.title}</h2>
      <div id={descriptionId} className="text-sm text-neutral-600">
        {currentStep.meta?.content}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs">{currentStepIndex + 1} / {totalSteps}</span>
        <div className="flex gap-2">
          <TourPreviousButton>Back</TourPreviousButton>
          <TourNextButton disabled={isWaiting}>
            {currentStepIndex === totalSteps - 1 ? "Done" : "Next"}
          </TourNextButton>
        </div>
      </div>
      <TourCloseButton className="absolute right-2 top-2" aria-label="Close tour">
        ×
      </TourCloseButton>
    </div>
  );
}
```

`TourRoot` is fully controlled — `open` and `stepIndex` must come back from your
own state, or the tour will not advance.

## Reusing your design system's button

```tsx
<TourNextButton asChild>
  <Button variant="primary" size="sm">Continue</Button>
</TourNextButton>
```

`asChild` merges props onto your element instead of rendering a `button`. Your
component must forward refs and spread props.

## Targets that don't exist yet

Opening a menu, loading data, mounting a modal:

```tsx
{
  id: "menu-item",
  target: { selector: '[data-tour-step="menu-item"]', timeout: 8000 },
}
```

The tracker watches the DOM and resolves as soon as the element appears with a
non-zero box. While waiting, `isWaiting` is true and the built-in card shows a
spinner with the Next button disabled.

If the element only appears after a user action the tour cannot perform, either
perform it in `onTargetWaiting`, or mark the step `strategy: "skip"`.

```tsx
<TourRoot
  onTargetWaiting={(stepId) => {
    if (stepId === "menu-item") setMenuOpen(true);
  }}
/>
```

## Multi-page tours

```tsx
const tours: TourConfig[] = [{
  id: "setup",
  steps: [
    { id: "profile", route: "/settings/profile", target: "#name" },
    { id: "billing", route: "/settings/billing", target: "#card" },
  ],
}];

<TourProvider tours={tours} onNavigate={(route) => router.push(route)}>
```

`onNavigate` fires as the step becomes active, then the tracker waits for the
target on the newly rendered page. Keep `strategy: "wait"` here.

To survive a full page reload, persist `activeTourId` and `stepIndex` yourself
and restore them with `startTour` + `goToStep` on mount.

## Run once per user

```tsx
function useOnboarding() {
  const { startTour } = useTour();
  React.useEffect(() => {
    if (localStorage.getItem("onboarded")) return;
    const id = setTimeout(() => startTour("onboarding"), 500); // let the page settle
    localStorage.setItem("onboarded", "1");
    return () => clearTimeout(id);
  }, [startTour]);
}
```

## Rendering inside a container

When the app lives in a modal, a shadow host, or a scrollable panel that
establishes its own stacking context:

```tsx
<TourProvider tours={tours} container={panelRef.current} config={{ zIndex: 50 }}>
```

Both the card and the spotlight portal into `container` instead of
`document.body`.

## Theming

The default card reads CSS custom properties, falling back to common design
token names:

```css
:root {
  --tour-bg: var(--popover, #fff);
  --tour-fg: var(--popover-foreground, #09090b);
  --tour-muted: var(--muted-foreground, #71717a);
  --tour-border: var(--border, rgba(0,0,0,.08));
  --tour-accent: var(--primary, #18181b);
  --tour-accent-fg: var(--primary-foreground, #fafafa);
  --tour-radius: 12px;
  --tour-width: 320px;
}
```

Dark mode keys off `.dark` or `[data-theme="dark"]`. Class hooks:
`.inklu-tour-card`, `.inklu-tour-body`, `.inklu-tour-title`,
`.inklu-tour-content`, `.inklu-tour-footer`, `.inklu-tour-btn-next`,
`.inklu-tour-btn-prev`, `.inklu-tour-close`, `.inklu-tour-spinner`.

The card also exposes `data-side`, `data-state` (`waiting` / `found`), and
`data-open` for state-driven styling.

## Localisation

```tsx
config={{
  labels: {
    next: "Suivant", previous: "Retour", finish: "Terminer",
    close: "Fermer la visite",
    stepCounter: (current, total) => `${current} sur ${total}`,
  },
}}
```

## Testing tours

**Unit (jsdom).** jsdom has no layout, so give targets a box or the tracker will
never resolve them:

```tsx
const el = document.createElement("div");
el.id = "target";
el.getBoundingClientRect = () => ({
  top: 10, left: 10, width: 100, height: 100, bottom: 110, right: 110,
}) as DOMRect;
el.scrollIntoView = vi.fn();
document.body.appendChild(el);
```

Then assert on roles rather than classes:

```tsx
const dialog = await screen.findByRole("dialog");
expect(dialog).toHaveAccessibleName("First step");
expect(screen.getByRole("status")).toHaveTextContent("First step, 1 of 2");
```

You also need `ResizeObserver` and `matchMedia` stubs in your test setup.

**End-to-end.** Query by role, not by internal class names:

```ts
await page.getByRole("button", { name: "Next" }).click();
await expect(page.getByRole("dialog")).toHaveAccessibleName("Second step");
await page.keyboard.press("Escape");
await expect(page.getByRole("dialog")).toBeHidden();
```

## Analytics

```tsx
<TourProvider
  tours={tours}
  onError={(e) => track("tour_target_missing", { message: e.message })}
/>
```

For step-level events use `TourRoot` directly, which exposes
`onTargetWaiting`, `onTargetFound`, `onTargetTimeout`, `onStepChange`,
`onComplete`, and `onDismiss`. `onComplete` fires only when the user finishes
the last step; `onDismiss` fires on Escape or the close button — track them
separately to measure completion rate.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Card sits in the bottom-right corner | No target resolved yet; the card parks there until one is found. |
| Step stuck on the spinner | Selector doesn't match, element is `visibility: hidden`, or its box is ≤ 5px. |
| Tour renders behind other UI | Raise `zIndex`, or portal into the right `container`. |
| Arrow keys move the tour while typing | Should not happen; check the event isn't being re-dispatched on `window` by other code. |
| `useTour must be used within a <TourProvider>` | The calling component isn't inside the provider's subtree. |
| Spotlight cutout is the wrong shape | The target is a wrapper element — point at the visible control instead. |
| Nothing happens on `startTour` | The id isn't in `tours`; check the console for the `[@inklu/tour]` warning. |
