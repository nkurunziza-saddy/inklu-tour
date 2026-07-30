import { act, render, renderHook, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { TourProvider, useTour } from "../react/composed";

// Mock the core machine so we don't have to deal with DOM interactions in this test
vi.mock("../core/machine", () => {
	return {
		TourEngine: class MockTourEngine {
			state = {
				open: false,
				stepIndex: 0,
				currentStep: null,
				mounted: false,
				rects: [],
				rectsStepId: null,
				isWaiting: false,
				isAnimatingExit: false,
				skipAnimation: false,
			};
			listeners = new Set<() => void>();

			getState() {
				return this.state;
			}
			subscribe(cb: () => void) {
				this.listeners.add(cb);
				return () => this.listeners.delete(cb);
			}
			setOptions() {}
			setProps(open: boolean, stepIndex: number, steps: any) {
				if (this.state.open === open && this.state.stepIndex === stepIndex)
					return;
				this.state = {
					...this.state,
					open,
					stepIndex,
					currentStep: steps[stepIndex] ?? null,
					mounted: open,
				};
				this.listeners.forEach((cb) => {
					cb();
				});
			}
			next() {
				this.state = { ...this.state, stepIndex: this.state.stepIndex + 1 };
				this.listeners.forEach((cb) => {
					cb();
				});
			}
			previous() {
				this.state = { ...this.state, stepIndex: this.state.stepIndex - 1 };
				this.listeners.forEach((cb) => {
					cb();
				});
			}
			close() {
				this.state = { ...this.state, open: false, mounted: false };
				this.listeners.forEach((cb) => {
					cb();
				});
			}
			setSkipAnimation(val: boolean) {
				this.state = { ...this.state, skipAnimation: val };
				this.listeners.forEach((cb) => {
					cb();
				});
			}
			destroy() {}
		},
	};
});

describe("Tour React Integration", () => {
	it("provides tour context correctly", () => {
		const tours = [
			{
				id: "tour-1",
				steps: [{ id: "step-1", target: "#foo" }],
			},
		];

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TourProvider tours={tours}>{children}</TourProvider>
		);

		const { result } = renderHook(() => useTour(), { wrapper });

		expect(result.current.isActive).toBe(false);
		expect(result.current.activeTourId).toBeNull();
		expect(typeof result.current.startTour).toBe("function");
		expect(typeof result.current.stopTour).toBe("function");
	});

	it("updates state when calling hooks", () => {
		const tours = [
			{
				id: "tour-1",
				steps: [
					{ id: "step-1", target: "#foo" },
					{ id: "step-2", target: "#bar" },
				],
			},
		];

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TourProvider tours={tours}>{children}</TourProvider>
		);

		const { result } = renderHook(() => useTour(), { wrapper });

		expect(result.current.isActive).toBe(false);

		act(() => {
			result.current.startTour("tour-1");
		});

		expect(result.current.isActive).toBe(true);
		expect(result.current.activeTourId).toBe("tour-1");

		act(() => {
			result.current.stopTour();
		});

		expect(result.current.isActive).toBe(false);
	});
});
