# Self-Healing CI — workspace instructions

The Nx Cloud fix agent reads this file (plus `AGENTS.md` context) before
proposing changes. Ndigo conventions: `STYLE_GUIDE.md` (how to write),
`ARCHITECTURE.md` (why the system is shaped this way), `CONTRIBUTING.md`
(workflow), `docs/guides/README.md` (task guides).

## Off-limits areas

- `api/` and `packages/*/api/` — generated TypeDoc trees; regenerate with
  `pnpm doc`, never hand-edit.
- `pnpm-lock.yaml` — dependency changes go through `pnpm install` / `pnpm add`
  in the owning workspace; never hand-edit the lockfile.
- `.opencode/`, `.omp/`, `.agent-local.json` — generated agent deployment;
  edit `agent-local/`, then run `pnpm agents:sync` and `pnpm agents:check`.
- `graft/` — local, gitignored code-graph cache; never propose changes there.
- `docs/plans/`, `docs/migrations/`, `docs/audits/`, `docs/decisions/` —
  historical records; do not rewrite them.

## Fix preferences

- `pnpm lint` runs with `--deny-warnings`; prefer fixing the code over
  weakening rules. Never introduce bare `as any` / `@ts-ignore` without a
  one-line reason (STYLE_GUIDE §8).
- TS/JS: 4-space indent, single quotes, 120 columns; run the writable formatter
  (`pnpm format`) rather than hand-wrapping markdown/JSON/YAML.
- Keep changes minimal and in the surrounding style; the public API surface is
  what `src/index.ts` exports — keep it stable unless the failure demands
  otherwise.

## CI-significant files — propose only

- `.github/workflows/**`, `nx.json`, `pnpm-workspace.yaml`, root
  `package.json` — always propose these for human review.
