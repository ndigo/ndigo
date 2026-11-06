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
```

- `--kind` — `node` (tsx) or `browser` (vite). Defaults to `node`.
- `--name` — app slug (kebab-case). Defaults to the target directory's basename.
- `--description` — one-line description used in the manifest and README.
- `--port` — dev port (default 3000).
- `--dir` — target directory (defaults to `./<name>`).
- `--yes` / `-y` — accept all defaults (non-interactive, CI-friendly).
- `--local` — rewrite `@ndigo/*` dependencies to `workspace:*` for development
  against a local Ndigo checkout (place the scaffolded app under `apps/` or add
  it to `pnpm-workspace.yaml`).
- `--force` — overwrite a non-empty target directory.

The scaffolded app uses the AD-90 lifecycle presets (`runNodeApplication` /
`createWebApplication`), ships a smoke test and (for the browser kind) the
bundle guard, and follows the conventions in
[guide 29](../../docs/guides/29-application-conventions.md).

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
