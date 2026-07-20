# Multiple Tours

Define and manage multiple independent tours in your application.

## Setup

Pass multiple tour configs to `TourProvider`:

```tsx
import { TourProvider, type TourConfig } from "@inklu/tour";

const tours: TourConfig[] = [
  {
    id: "onboarding",
    steps: [
      {
        id: "welcome",
        meta: { title: "Welcome!", content: "Welcome to our app." },
      },
      {
        id: "dashboard",
        meta: { title: "Your Dashboard", content: "This is your main dashboard." },
      },
    ],
  },
  {
    id: "settings-guide",
    steps: [
      {
        id: "profile",
        meta: { title: "Profile Settings", content: "Customize your profile here." },
      },
      {
        id: "preferences",
        meta: { title: "Preferences", content: "Set your app preferences." },
      },
    ],
  },
];

export default function RootLayout({ children }) {
  return <TourProvider tours={tours}>{children}</TourProvider>;
}
```

## Starting Different Tours

Use the `useTour` hook to start specific tours by their ID:

```tsx
"use client";

import { useTour } from "@inklu/tour";

export function TourButtons() {
  const { startTour } = useTour();

  return (
    <div>
      <button onClick={() => startTour("onboarding")}>Start Onboarding</button>
      <button onClick={() => startTour("settings-guide")}>Settings Guide</button>
    </div>
  );
}
```

## Use Cases

Multiple tours are useful for:

- **Onboarding vs. Feature Tours**: Separate initial user onboarding from specific feature walkthroughs
- **Role-Based Tours**: Different tours for different user roles (admin, editor, viewer)
- **Context-Specific Guides**: Show different tours based on the current page or user action
