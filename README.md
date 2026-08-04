# inklu-tour

Monorepo for [`@inklu/tour`](./packages/tour) — accessible, headless product
tours for React.

## Layout

| Path | What it is |
| --- | --- |
| `packages/tour` | The published `@inklu/tour` package. |
| `apps/docs` | Next.js documentation site. |
| `apps/playground` | Vite app used as the Playwright end-to-end target. |
| `skills/inklu-tour` | Agent skill teaching coding agents how to use the library. |

## Agent skill

`skills/inklu-tour` is a [Claude Code skill](https://docs.claude.com/en/docs/claude-code/skills):
a guided walkthrough that teaches an agent how to build tours with this
library, plus a full API reference and recipes. Install it via
[skills.sh](https://skills.sh):

```sh
npx skills add nkurunziza-saddy/inklu-tour
```

This pulls `skills/inklu-tour` into `.claude/skills` (project-scoped) or
`~/.claude/skills` (user-scoped) depending on how you invoke it — see the
[skills CLI docs](https://github.com/vercel-labs/skills) for flags. Start a new
agent session afterwards to pick it up.

When changing the library's public API, update `skills/inklu-tour/` in the same
change — it is documentation that ships to agents, and stale guidance is worse
than none.

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
