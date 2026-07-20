# Multipage Tours

Create tours that span across multiple pages.

## Setup

Pass an `onNavigate` callback to `TourProvider` to wire your router:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { TourProvider, type TourConfig } from "@inklu/tour";

const tours: TourConfig[] = [
  {
    id: "onboarding",
    steps: [
      {
        id: "home-hero",
        meta: {
          title: "Welcome",
          content: "Welcome to our application! Let's start the tour.",
        },
        route: "/",
      },
      {
        id: "dashboard-stats",
        meta: {
          title: "Dashboard",
          content: "Here you can see your key metrics and statistics.",
        },
        route: "/dashboard",
      },
      {
        id: "settings-profile",
        meta: {
          title: "Settings",
          content: "Customize your profile and preferences here.",
        },
        route: "/settings",
      },
    ],
  },
];

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <TourProvider tours={tours} onNavigate={router.push}>
      {children}
    </TourProvider>
  );
}
```

When a step with a `route` property becomes active (either by starting the tour or advancing steps), the `onNavigate` callback is called with that route. The tour will automatically wait for the target element to appear on the new page before showing the step.
