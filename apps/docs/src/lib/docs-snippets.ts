/**
 * Code snippets for @inklu/tour documentation, syntax-highlighted server-side with Shiki.
 */
export const SNIPPETS = {
	cmdPnpm: {
		lang: "bash",
		code: "pnpm add @inklu/tour",
	},
	cmdNpm: {
		lang: "bash",
		code: "npm install @inklu/tour",
	},
	cmdYarn: {
		lang: "bash",
		code: "yarn add @inklu/tour",
	},
	cmdBun: {
		lang: "bash",
		code: "bun add @inklu/tour",
	},
	quickStart: {
		lang: "tsx",
		code: `import { type TourConfig, TourProvider, useTour } from "@inklu/tour/react";

const tours: TourConfig[] = [
  {
    id: "onboarding-tour",
    steps: [
      {
        id: "step-welcome",
        target: "#welcome-header",
        placement: "bottom-center",
        meta: {
          title: "Welcome aboard!",
          content: "Let's take a quick tour around the dashboard.",
        },
      },
      {
        id: "step-features",
        target: ".feature-grid",
        placement: "top-center",
        meta: {
          title: "Powerful Features",
          content: "Explore our collection of tools and utilities.",
        },
      },
    ],
  },
];

export function App({ children }: { children: React.ReactNode }) {
  return <TourProvider tours={tours}>{children}</TourProvider>;
}

export function StartTourButton() {
  const { startTour } = useTour();
  return (
    <button onClick={() => startTour("onboarding-tour")}>
      Start Tour
    </button>
  );
}`,
	},
	tourProviderConfig: {
		lang: "tsx",
		code: `<TourProvider
  tours={tours}
  onNavigate={(route) => router.push(route)}
  enableAudio={true}
  config={{
    closeOnOutsideClick: true,
    closeOnOverlayClick: true,
    keyboardNavigation: true,
    dismissOnEscape: true,
    showSpotlight: true,
    spotlightPadding: 10,
    maskOpacity: 0.7,
    targetPulse: true,
    cardOffset: 16,
  }}
>
  {children}
</TourProvider>`,
	},
	targetConfig: {
		lang: "tsx",
		code: `const tour: TourConfig = {
  id: "advanced-tour",
  steps: [
    {
      id: "step-1",
      // Simple CSS Selector
      target: "#main-heading",
    },
    {
      id: "step-2",
      // Target with Timeout & Skip Strategy
      target: {
        selector: ".async-loaded-modal",
        timeout: 3000,
        strategy: "skip", // Automatically skips to next step if missing
      },
    },
  ],
};`,
	},
	compositionExample: {
		lang: "tsx",
		code: `import {
  TourRoot,
  TourSpotlight,
  TourCard,
  TourArrow,
  TourNextButton,
  TourPreviousButton,
  TourCloseButton,
} from "@inklu/tour/react";

export function CustomTour({ tour, open, onOpenChange }: TourRootProps) {
  return (
    <TourRoot tour={tour} open={open} onOpenChange={onOpenChange}>
      <TourSpotlight fill="black" stroke="var(--tour-accent)" />
      <TourCard className="custom-card-container">
        <TourArrow />
        <TourCloseButton />
        <h2>Custom Tour Step</h2>
        <div className="flex justify-between">
          <TourPreviousButton>Back</TourPreviousButton>
          <TourNextButton>Next Step</TourNextButton>
        </div>
      </TourCard>
    </TourRoot>
  );
}`,
	},
	audioExample: {
		lang: "tsx",
		code: `// Audio synthesis is enabled by default in <TourProvider enableAudio={true} />
// You can custom attribute any element in your custom tour card:

<button data-sound-click="turn:forward">Next</button>
<button data-sound-click="turn:backward">Previous</button>
<button data-sound-click="close">Dismiss</button>`,
	},
} as const;
