import { type TourConfig, TourProvider, useTour } from "@inklu/tour/react";

function TargetApp() {
  const { startTour } = useTour();

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Playground</h1>
      <button
        type="button"
        data-testid="start-tour"
        onClick={() => startTour("demo")}
      >
        Start Tour
      </button>
      <button
        type="button"
        data-testid="start-skip-demo"
        onClick={() => startTour("skip-demo")}
        style={{ marginLeft: 16 }}
      >
        Start Skip Demo
      </button>

      <div
        style={{
          marginTop: 100,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          id="target-1"
          style={{ width: 100, height: 100, backgroundColor: "salmon" }}
        >
          Target 1
        </div>
        <div
          id="target-2"
          style={{ width: 100, height: 100, backgroundColor: "lightblue" }}
        >
          Target 2
        </div>
      </div>
    </div>
  );
}

const tours: TourConfig[] = [
  {
    id: "demo",
    steps: [
      {
        id: "step-1",
        target: "#target-1",
        placement: "bottom" as const,
        meta: {
          title: "First Target",
          content: "This is the first target.",
        },
      },
      {
        id: "step-2",
        target: "#target-2",
        placement: "bottom" as const,
        meta: {
          title: "Second Target",
          content: "This is the second target.",
        },
      },
    ],
  },
  {
    id: "skip-demo",
    steps: [
      {
        id: "step-1",
        target: "#target-1",
        placement: "bottom" as const,
        meta: { title: "First", content: "..." },
      },
      {
        id: "missing-step",
        target: { selector: "#missing", strategy: "skip", timeout: 100 },
        placement: "bottom" as const,
        meta: { title: "Missing", content: "This should be skipped." },
      },
      {
        id: "step-2",
        target: "#target-2",
        placement: "bottom" as const,
        meta: { title: "Second", content: "..." },
      }
    ]
  }
];

export default function App() {
  return (
    <TourProvider tours={tours} config={{ closeOnOverlayClick: true }}>
      <TargetApp />
    </TourProvider>
  );
}
