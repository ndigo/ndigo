# `tools/` — repo-only tooling and content

Code and authored content in this tree serve the Ndigo **repository itself** —
never a consumer. Code tenants must **present as a package**: a resolvable
name, a collection manifest, workspace-linked dependencies — Nx's own
local-plugin convention (`@nx/plugin:plugin tools/<name>`). Nothing here is
published; package tenants are `private: true`.

Current tenants:

- `generators/` — the `@ndigo/generators` Nx collection behind
  `ndigo new` / `ndigo generate`. See
  [`generators/README.md`](generators/README.md).
- `agent-content/` — the managed `AGENTS.md` block, the vendored
  [`ndigo-skills`](https://github.com/ndigo/ndigo-skills) snapshot, and the
  build that emits CLI assets and `create-ndigo-app` templates. See
  [`agent-content/README.md`](agent-content/README.md).

The homes, by role:

| Home        | Role                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| `packages/` | consumer packages — everything there is intended for consumers           |
| `tools/`    | repo-only tooling and authored content (never published)                 |
| `src/`      | repo-only code loaded by path — no package identity (e.g. `src/oxlint/`) |
| `scripts/`  | one-shot probes and root tooling entry points                            |
