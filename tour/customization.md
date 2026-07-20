# Customization

## Theming with CSS Variables

The tour card ships with a default theme that supports both light and dark modes. Customise the appearance by overriding `--tour-*` CSS variables anywhere in your stylesheet:

```css
:root {
  --tour-bg: #ffffff;          /* Card background */
  --tour-fg: #09090b;          /* Card text color */
  --tour-muted: #71717a;       /* Secondary text, step counter */
  --tour-border: rgba(0,0,0,0.08); /* Card border */
  --tour-accent: #18181b;      /* Primary button background */
  --tour-accent-fg: #fafafa;   /* Primary button text */
  --tour-secondary: #f4f4f5;   /* Progress bar track */
  --tour-radius: 12px;         /* Card border-radius */
  --tour-shadow: 0 4px 24px rgba(0,0,0,0.08); /* Card shadow */
  --tour-width: 320px;         /* Card width */
}
```

### Dark Mode

The package automatically detects `.dark` or `[data-theme="dark"]` on any ancestor element (compatible with `next-themes`, Tailwind, and shadcn/ui). Override the dark palette the same way:

```css
.dark {
  --tour-accent: #3b82f6;   /* blue accent in dark mode */
}
```

### System Dark Mode

If your app relies on `prefers-color-scheme` instead of class-based dark mode, add this to your stylesheet:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --tour-bg: #18181b;
    --tour-fg: #fafafa;
    --tour-muted: #a1a1aa;
    --tour-border: rgba(255,255,255,0.1);
    --tour-accent: #fafafa;
    --tour-accent-fg: #18181b;
    --tour-secondary: #27272a;
    --tour-shadow: 0 4px 24px rgba(0,0,0,0.32);
  }
}
```

## Per-Step Customization

Each step accepts a `placement` property to control card positioning:

```tsx
{
  id: "sidebar",
  placement: "right-center",
  meta: { title: "Sidebar", content: "Your workspace navigation." },
}
```

Available placements: `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`, `left-start`, `left-center`, `left-end`, `right-start`, `right-center`, `right-end`.

The card auto-flips to the opposite side if there isn't enough viewport space.

## Full Control: Primitive API

If CSS variables aren't enough and you need a completely custom card layout, use the headless primitives:

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
} from "@inklu/tour/primitive";

function CustomTour(props) {
  return (
    <TourRoot {...props}>
      <TourSpotlight fill="black" maskOpacity={0.5} />
      <TourCard className="my-custom-card">
        <TourArrow />
        <MyCardContent />
      </TourCard>
    </TourRoot>
  );
}
```

For the full list of available primitives, see the [API Reference](api-reference.md).
