# inklu-tour

Monorepo for [`@inklu/tour`](./packages/tour) — accessible, headless product
tours for React.

## Layout

| Path | What it is |
| --- | --- |
| `packages/tour` | The published `@inklu/tour` package. |
| `apps/playground` | Vite app used as the Playwright end-to-end target. |
| `apps/docs` | Next.js documentation site. |

## Development

```sh
pnpm install
pnpm dev            # every workspace in watch mode
pnpm build          # build all workspaces
```

## Checks

```sh
pnpm lint           # biome
pnpm check-types    # tsc --noEmit
pnpm test           # vitest, all workspaces
pnpm test:unit      # vitest, package only
pnpm test:watch     # vitest, watch mode
pnpm test:coverage  # vitest with coverage thresholds
pnpm test:e2e       # playwright against the playground
```

The end-to-end suite starts its own dev server. If the default port is busy,
override it:

```sh
PLAYGROUND_PORT=5399 pnpm test:e2e
```

## Releasing

`packages/tour` builds via tsup into ESM + CJS with type declarations.
`prepublishOnly` runs the build, and CI asserts the React entry keeps its
`"use client"` directive while the core entry stays server-safe.

```sh
pnpm --filter @inklu/tour publish
```

## License

MIT
