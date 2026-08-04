# @inklu/tour

## 0.2.0

### Minor Changes

- 800df1d: Production hardening, accessibility, and a publishable build.

  ### Fixed

  - **`"use client"` is now preserved in the build.** esbuild strips module-level
    directives when bundling, so the React entry previously shipped without it and
    was unusable in the Next.js App Router.
  - **Arrow-key shortcuts no longer hijack typing.** Keydown events originating
    from inputs, textareas, selects, or contenteditable — and those with modifier
    keys, during IME composition, or already `defaultPrevented` — are ignored.
  - **The target tracker no longer restarts on every parent re-render.** Passing a
    fresh `tours` array literal used to clear the measured rects, flash the
    waiting state, and re-run `scrollIntoView`. The engine now re-tracks only when
    a step's resolved target actually changes.
  - **`strategy: "error"` no longer throws from a timer callback**, where nothing
    could catch it. It reports through the new `onError` option instead.
  - Fixed a StrictMode/Fast Refresh hazard where a torn-down engine stayed dead
    after remount.
  - A `border-radius` of `0` is no longer coerced to `8`, so square targets get
    square spotlight cutouts.
  - The spotlight mask id is now scoped per instance; two mounted spotlights used
    to collide.
  - Step ids that aren't valid CSS selectors now still resolve through the
    `data-tour-step` fallback, and attribute values are escaped.

  ### Added

  - Accessibility: the card is a `role="dialog"` with an accessible name and
    description (`labelId` / `descriptionId` on the context), focus moves in on
    open and is restored on close, and step changes are announced through a live
    region. New options: `autoFocus`, `restoreFocus`, `announceSteps`,
    `trapFocus`.
  - `zIndex` and `container` options for stacking and portal control.
  - `onError` on `TourProvider` and `TourRoot`.
  - `stepIndex` and `goToStep` on `useTour()`.
  - `Tour` is now exported: `TourRoot`'s controlled API with the default UI.
  - `labels.close` and `labels.stepCounter(current, total)` for localisation.
  - Typed `Placement` union and `ReactNode`-typed step `meta`.
  - An agent skill (`skills/inklu-tour`), installable via
    `npx skills add nkurunziza-saddy/inklu-tour` ([skills.sh](https://skills.sh)).

  ### Changed — review before upgrading

  - **`enableAudio` now defaults to `false`** and `@inklu/audio` is an optional
    peer dependency loaded on demand. Projects that want sound must install the
    package and set the prop.
  - **`strategy: "error"` reports instead of throwing.** Any `try/catch` around it
    never worked; move the handling to `onError`.
  - **`TourStep` and `TourConfig` exported from `@inklu/tour/react` are now the
    `ReactNode`-typed variants.** The framework-agnostic versions remain on the
    root entry.

  ### Removed

  - The `./vue` and `./svelte` entry points, which contained no adapters — only a
    re-export of the core — while advertising framework support through their
    peer dependencies. The core is still available on the root entry for building
    an adapter.
