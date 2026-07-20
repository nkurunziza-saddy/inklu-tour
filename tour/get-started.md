# Get Started

An onboarding tour component for React. Batteries-included by default, fully customisable when you need it.

## Installation

```bash
# pnpm
pnpm add @inklu/tour

# npm
npm install @inklu/tour

# yarn
yarn add @inklu/tour

# bun
bun add @inklu/tour
```

## Concepts

### Tour

A Tour represents a complete onboarding flow or a guide for a specific feature. It is identified by a unique `id` and contains a sequence of steps. You can define multiple tours in your application (e.g., `"onboarding"`, `"new-feature-x"`, `"settings-guide"`) and start them independently.

### Step

A Step is a single card in the tour sequence. Each step targets specific elements on the page using the `data-tour-step` attribute or a custom CSS selector.

## Usage

### 1. Wrap with `TourProvider`

Wrap your application (or a subtree) with `TourProvider` and pass your tours configuration:

```tsx
// app/layout.tsx
import { TourProvider, type TourConfig } from "@inklu/tour";

const tours: TourConfig[] = [
  {
    id: "main",
    steps: [
      {
        id: "welcome",
        meta: {
          title: "Welcome",
          content: "Let's take a quick tour of the main features.",
        },
      },
      {
        id: "feature-1",
        meta: {
          title: "Feature One",
          content: "This is an important feature.",
        },
      },
    ],
  },
];

export default function RootLayout({ children }) {
  return <TourProvider tours={tours}>{children}</TourProvider>;
}
```

That's it — no UI components to build, no context to wire. The package handles the spotlight, card, progress bar, navigation buttons, and animations for you.

### 2. Start the Tour

Use the `useTour` hook to control the tour from anywhere:

```tsx
"use client";

import { useTour } from "@inklu/tour";

export function StartTourButton() {
  const { startTour } = useTour();

  return <button onClick={() => startTour("main")}>Start Tour</button>;
}
```

### 3. Mark Target Elements

Add `data-tour-step` attributes to elements you want to highlight. The tour will automatically find and spotlight elements matching each step's `id`:

```tsx
<div data-tour-step="welcome">
  <h1>Welcome to My App</h1>
</div>

<div data-tour-step="feature-1">
  <p>This is a feature</p>
</div>
```

Or use CSS selectors via the `target` property on a step:

```tsx
{
  id: "sidebar",
  target: { selector: ".app-sidebar" },
  meta: { title: "Sidebar", content: "Navigate your workspace here." },
}
```

### 4. Route Navigation (optional)

For multi-page tours, pass an `onNavigate` callback to `TourProvider`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { TourProvider } from "@inklu/tour";

function Providers({ children }) {
  const router = useRouter();
  return (
    <TourProvider tours={tours} onNavigate={router.push}>
      {children}
    </TourProvider>
  );
}
```

Then add `route` to any step that requires a page change:

```tsx
{
  id: "settings",
  route: "/settings",
  meta: { title: "Settings", content: "Customise your preferences here." },
}
```

## Headless / Primitive API

If you need full control over the UI, import from `@inklu/tour/primitive`:

```tsx
import {
  TourRoot,
  TourCard,
  TourSpotlight,
  TourArrow,
  TourNextButton,
  TourPreviousButton,
  TourCloseButton,
  useTourContext,
} from "@inklu/tour/primitive";
```

This gives you unstyled, composable building blocks with the `asChild` pattern (like Radix UI). See the [API Reference](api-reference.md) for the full list.
