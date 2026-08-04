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
        placement: "bottom",
        meta: {
          title: "Welcome aboard!",
          content: "Let's take a quick tour around the dashboard.",
        },
      },
      {
        id: "step-features",
        target: ".feature-grid",
        placement: "top",
        meta: {
          title: "Powerful Features",
          // content accepts any ReactNode, not just strings.
          content: <>Explore our <strong>tools</strong> and utilities.</>,
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
  onError={(error) => reportToSentry(error)}
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
    zIndex: 9998,
  }}
>
  {children}
</TourProvider>`,
	},
	useTourApi: {
		lang: "tsx",
		code: `const {
  startTour,   // (id: string) => void
  stopTour,    // () => void
  goToStep,    // (index: number) => void
  stepIndex,   // number
  isActive,    // boolean
  activeTourId,// string | null
  config,      // TourConfigOptions
  updateConfig,// (partial: Partial<TourConfigOptions>) => void
} = useTour();

// Configuration can be changed while a tour is running.
updateConfig({ maskOpacity: 0.3, targetPulse: true });`,
	},
	targetConfig: {
		lang: "tsx",
		code: `const tour: TourConfig = {
  id: "advanced-tour",
  steps: [
    {
      id: "step-1",
      // Simple CSS selector
      target: "#main-heading",
    },
    {
      id: "step-2",
      // Target with timeout & skip strategy
      target: {
        selector: ".async-loaded-modal",
        timeout: 3000,
        strategy: "skip", // Advances to the next step if still missing
      },
    },
    {
      // No target: the step id is matched against [data-tour-step="step-3"].
      // Survives refactors that change classnames or markup structure.
      id: "step-3",
    },
  ],
};`,
	},
	dataAttrTarget: {
		lang: "tsx",
		code: `// Tag the element instead of coupling the tour to a CSS selector:
<button data-tour-step="step-3">Publish</button>`,
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
  useTourContext,
  type TourRootProps,
} from "@inklu/tour/react";

export function CustomTour(props: TourRootProps) {
  return (
    <TourRoot {...props}>
      <TourSpotlight fill="black" stroke="var(--tour-accent)" />
      <TourCard className="custom-card-container">
        <TourArrow />
        <CustomBody />
      </TourCard>
    </TourRoot>
  );
}

function CustomBody() {
  // labelId / descriptionId keep the dialog's accessible name and description
  // wired up. Always attach them when you replace the default card.
  const { currentStep, currentStepIndex, totalSteps, labelId, descriptionId } =
    useTourContext();

  return (
    <>
      <h2 id={labelId}>{currentStep?.meta?.title}</h2>
      <div id={descriptionId}>{currentStep?.meta?.content}</div>
      <div className="flex justify-between">
        <TourPreviousButton>Back</TourPreviousButton>
        <TourNextButton>
          {currentStepIndex === totalSteps - 1 ? "Done" : "Next"}
        </TourNextButton>
      </div>
      <TourCloseButton>Dismiss</TourCloseButton>
    </>
  );
}`,
	},
	asChildExample: {
		lang: "tsx",
		code: `// Every button accepts asChild to render your own component instead.
<TourNextButton asChild>
  <Button variant="primary">Continue</Button>
</TourNextButton>`,
	},
	a11yExample: {
		lang: "tsx",
		code: `<TourProvider
  tours={tours}
  config={{
    autoFocus: true,      // move focus to the card on open (default)
    restoreFocus: true,   // hand focus back on close (default)
    announceSteps: true,  // announce step changes politely (default)
    trapFocus: false,     // opt in only for genuinely modal tours
  }}
>`,
	},
	i18nExample: {
		lang: "tsx",
		code: `<TourProvider
  tours={tours}
  config={{
    labels: {
      next: "Suivant",
      previous: "Retour",
      finish: "Terminer",
      close: "Fermer la visite",
      stepCounter: (current, total) => \`\${current} sur \${total}\`,
    },
  }}
>`,
	},
	errorStrategyExample: {
		lang: "tsx",
		code: `// strategy: "error" reports through onError — it never throws, because the
// timeout fires inside a timer callback where nothing could catch it.
<TourProvider
  tours={tours}
  onError={(error) => {
    console.error(error); // "Tour target timeout: #checkout-button"
    analytics.track("tour_target_missing", { message: error.message });
  }}
>`,
	},
	audioExample: {
		lang: "tsx",
		code: `// Audio is an OPTIONAL peer dependency and is off by default.
// Install it, then opt in — it is imported on demand, so consumers who
// don't enable it never pay the bundle cost.
//
//   pnpm add @inklu/audio
//
<TourProvider tours={tours} enableAudio>
  {children}
</TourProvider>

// Any element in a custom card can carry a sound hook:
<button data-sound-click="turn:forward">Next</button>
<button data-sound-click="turn:backward">Previous</button>
<button data-sound-click="close">Dismiss</button>`,
	},
	coreExample: {
		lang: "ts",
		code: `// The root entry is React-free: use it to build your own adapter.
import { TourEngine, TargetTracker, calculatePosition } from "@inklu/tour";

const engine = new TourEngine();
engine.setOptions({ onStepChange: (i) => render(i) });
engine.subscribe(() => render(engine.getState()));
engine.setProps(true, 0, steps);`,
	},
	skillInstall: {
		lang: "bash",
		code: "npx skills add nkurunziza-saddy/inklu-tour",
	},
	controlledTour: {
		lang: "tsx",
		code: `import { Tour } from "@inklu/tour/react";

// Same props as TourRoot, but keeps the built-in card.
// Use this instead of TourProvider when you own the state.
const [open, setOpen] = useState(false);
const [step, setStep] = useState(0);

<Tour
  tour={tour}
  open={open}
  onOpenChange={setOpen}
  stepIndex={step}
  onStepChange={setStep}
  onComplete={() => markOnboarded()}
/>;`,
	},
	nextjsExample: {
		lang: "tsx",
		code: `// app/providers.tsx
"use client";

import { TourProvider, type TourConfig } from "@inklu/tour/react";
import { useRouter } from "next/navigation";

const tours: TourConfig[] = [/* ... */];

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <TourProvider tours={tours} onNavigate={(route) => router.push(route)}>
      {children}
    </TourProvider>
  );
}`,
	},
} as const;
