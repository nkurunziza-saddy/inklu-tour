import { describe, expect, it } from "vitest";
import * as core from "../index";
import * as react from "../react/index";

/**
 * The public surface is documented in README.md, the docs site, and the
 * `inklu-tour` agent skill. Pinning it here makes an accidental rename or
 * removal a test failure rather than silently stale documentation.
 */
describe("public exports", () => {
	it("exposes the framework-agnostic core without React", () => {
		expect(Object.keys(core).sort()).toEqual(
			[
				"TOUR_ANIMATION_DURATION",
				"TOUR_EXIT_DURATION",
				"TargetTracker",
				"TourEngine",
				"DEFAULT_TARGET_TIMEOUT",
				"calculatePosition",
				"rectsEqual",
				"toRect",
				"unionOf",
			].sort(),
		);
	});

	it("exposes the documented React surface", () => {
		expect(Object.keys(react).sort()).toEqual(
			[
				"DEFAULT_CONFIG",
				"TOUR_ANIMATION_DURATION",
				"TOUR_EXIT_DURATION",
				"Tour",
				"TourArrow",
				"TourCard",
				"TourCloseButton",
				"TourContext",
				"TourNextButton",
				"TourPreviousButton",
				"TourProvider",
				"TourRoot",
				"TourSettingsMorph",
				"TourSpotlight",
				"calculatePosition",
				"rectsEqual",
				"toRect",
				"unionOf",
				"useTour",
				"useTourContext",
			].sort(),
		);
	});

	it("keeps the default config in sync with the documented defaults", () => {
		// These are the values written down in the docs table and the skill.
		expect(react.DEFAULT_CONFIG).toMatchObject({
			keyboardNavigation: true,
			dismissOnEscape: true,
			closeOnOutsideClick: false,
			closeOnOverlayClick: false,
			showSpotlight: true,
			spotlightPadding: 8,
			maskOpacity: 0.6,
			autoScroll: true,
			cardOffset: 16,
			showArrow: true,
			targetPulse: false,
			zIndex: 9998,
			trapFocus: false,
			autoFocus: true,
			restoreFocus: true,
			announceSteps: true,
		});
	});
});
