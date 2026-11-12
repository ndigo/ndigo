# create-ndigo-app

> Scaffold a standalone Ndigo application (node or browser kind).

## Installation

```bash
npm create ndigo-app@latest
```

Prerequisites: Node.js ≥24 and pnpm ≥12.

## Getting Started

```bash
npm create ndigo-app@latest my-app
cd my-app
pnpm install
pnpm start        # node kind
# or: pnpm dev    # browser kind
```

## Usage

```
create-ndigo-app [dir] [--kind node|browser] [--name <slug>]
                 [--description "..."] [--port N] [--yes] [--local] [--force]
                 [--agents|--no-agents] [--ui|--no-ui]
```

- `--kind` — `node` (tsx) or `browser` (vite). Defaults to `node`, or to
  `browser` when `--ui` is given.
- `--name` — app slug (kebab-case). Defaults to the target directory's basename.
- `--description` — one-line description used in the manifest and README.
- `--port` — dev port (default 3000).
- `--dir` — target directory (defaults to `./<name>`).
- `--yes` / `-y` — accept all defaults (non-interactive, CI-friendly).
- `--local` (or `CREATE_NDIGO_APP_LOCAL=1`) — rewrite `@ndigo/*` dependencies to `workspace:*` for development
  against a local Ndigo checkout (place the scaffolded app under `apps/` or add
  it to `pnpm-workspace.yaml`).
- `--force` — overwrite a non-empty target directory.
- `--agents` / `--no-agents` — write or omit the `AGENTS.md` bootstrap pointer
  (default on; `--yes` implies on). The pointer tells an agent to run
  `ndigo ai:init` for the full, version-matched context.
- `--ui` / `--no-ui` — write the Ndigo UI pointer (default off; `--yes` does not
  imply it). Browser kind only: `--ui` with `--kind node` is a usage error.

### Design system

`--ui` writes `ndigo.ui.json` — the same schema, registry default, and
`@ui`/`@lib`/`@components`/`@hooks` aliases `ndigo ui init` writes — adds
`@ndigo/ui` to the dependencies, and imports the tokens from the entry
stylesheet:

```css
@import '@ndigo/ui/tokens.css';
```

The scaffold writes **pointers only**. Components, extra theme layers, and
`ui.lock.json` are version-bearing content installed by the CLI, so nothing
under `templates/` duplicates `packages/ndigo-ui/registry/`:

```bash
pnpm exec ndigo ui add button input field
pnpm exec ndigo ui list
```

`ndigo ui add theme` is the copy-in alternative to the `@ndigo/ui` token
import — an application uses one or the other, never both.

The scaffolded app uses the AD-90 lifecycle presets (`createNodeApplication` /
`createWebApplication`), ships a smoke test and (for the browser kind) the
bundle guard, and follows the conventions in
[guide 91](../../docs/guides/91-application-conventions.md).

## API

See the [generated API reference](api/README.md).

## Development

```bash
pnpm --filter create-ndigo-app build:lib
pnpm --filter create-ndigo-app test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
