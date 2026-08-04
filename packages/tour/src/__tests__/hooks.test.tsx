import {
	act,
	render,
	renderHook,
	screen,
	waitFor,
} from "@testing-library/react";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TourProvider, useTour } from "../react/composed";
import type { TourConfig } from "../react/types";

// Exercised against the real engine rather than a mock: a stand-in for the
// module under test only ever proves the stand-in works.
const tours: TourConfig[] = [
	{
		id: "tour-1",
		steps: [
			{ id: "step-1", target: "#foo", meta: { title: "One" } },
			{ id: "step-2", target: "#bar", meta: { title: "Two" }, route: "/bar" },
		],
	},
];

function sizeTarget(id: string) {
	const el = document.createElement("div");
	el.id = id;
	el.getBoundingClientRect = () =>
		({
			top: 10,
			left: 10,
			width: 100,
			height: 100,
			bottom: 110,
			right: 110,
		}) as DOMRect;
	el.scrollIntoView = vi.fn();
	document.body.appendChild(el);
	return el;
}

const wrapper =
	(props: Partial<React.ComponentProps<typeof TourProvider>> = {}) =>
	({ children }: { children: React.ReactNode }) => (
		<TourProvider tours={tours} {...props}>
			{children}
		</TourProvider>
	);

beforeEach(() => {
	sizeTarget("foo");
	sizeTarget("bar");
});

describe("useTour", () => {
	it("throws a useful error when used outside a provider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => renderHook(() => useTour())).toThrow(
			"useTour must be used within a <TourProvider>",
		);
		spy.mockRestore();
	});

	it("exposes the manager surface with sensible initial state", () => {
		const { result } = renderHook(() => useTour(), { wrapper: wrapper() });

		expect(result.current.isActive).toBe(false);
		expect(result.current.activeTourId).toBeNull();
		expect(result.current.stepIndex).toBe(0);
		expect(typeof result.current.startTour).toBe("function");
		expect(typeof result.current.stopTour).toBe("function");
	});

	it("starts and stops a tour", () => {
		const { result } = renderHook(() => useTour(), { wrapper: wrapper() });

		act(() => result.current.startTour("tour-1"));
		expect(result.current.isActive).toBe(true);
		expect(result.current.activeTourId).toBe("tour-1");

		act(() => result.current.stopTour());
		expect(result.current.isActive).toBe(false);
	});

	it("warns and stays closed for an unknown tour id", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const { result } = renderHook(() => useTour(), { wrapper: wrapper() });

		act(() => result.current.startTour("nope"));

		expect(result.current.isActive).toBe(false);
		expect(spy).toHaveBeenCalledWith(
			'[@inklu/tour] No tour registered with id "nope".',
		);
		spy.mockRestore();
	});

	it("restarts at step 0 even after advancing", () => {
		const { result } = renderHook(() => useTour(), { wrapper: wrapper() });

		act(() => result.current.startTour("tour-1"));
		act(() => result.current.goToStep(1));
		expect(result.current.stepIndex).toBe(1);

		act(() => result.current.stopTour());
		act(() => result.current.startTour("tour-1"));
		expect(result.current.stepIndex).toBe(0);
	});

	it("fires onNavigate for steps that declare a route", () => {
		const onNavigate = vi.fn();
		const { result } = renderHook(() => useTour(), {
			wrapper: wrapper({ onNavigate }),
		});

		act(() => result.current.startTour("tour-1"));
		expect(onNavigate).not.toHaveBeenCalled();

		act(() => result.current.goToStep(1));
		expect(onNavigate).toHaveBeenCalledWith("/bar");
	});

	it("merges config updates at runtime", () => {
		const { result } = renderHook(() => useTour(), {
			wrapper: wrapper({ config: { maskOpacity: 0.6 } }),
		});

		act(() => result.current.updateConfig({ spotlightPadding: 20 }));

		expect(result.current.config.maskOpacity).toBe(0.6);
		expect(result.current.config.spotlightPadding).toBe(20);
	});

	it("renders the tour UI end to end", async () => {
		function App() {
			const { startTour } = useTour();
			return (
				<button type="button" onClick={() => startTour("tour-1")}>
					start
				</button>
			);
		}

		render(
			<TourProvider tours={tours}>
				<App />
			</TourProvider>,
		);

		act(() => screen.getByRole("button", { name: "start" }).click());

		const dialog = await screen.findByRole("dialog");
		await waitFor(() => expect(dialog).toHaveAccessibleName("One"));
		expect(screen.getByText("1 of 2")).toBeInTheDocument();
	});
});
