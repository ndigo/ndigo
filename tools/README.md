# `tools/` — repo-only, package-shaped tooling

Code in this tree serves the Ndigo **repository itself** — never a consumer.
Unlike root `src/`, it must **present as a package**: a resolvable name, a
collection manifest, workspace-linked dependencies — Nx's own local-plugin
convention (`@nx/plugin:plugin tools/<name>`). Nothing here is published;
members are `private: true`.

Current tenants:

- `generators/` — the `@ndigo/generators` Nx collection behind
  `ndigo new` / `ndigo generate`. See
  [`generators/README.md`](generators/README.md).

The homes, by role (AD-93):

| Home        | Role                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| `packages/` | consumer packages — everything there is intended for consumers           |
| `tools/`    | repo-only tooling that presents as a package (name, manifest, deps)      |
| `src/`      | repo-only code loaded by path — no package identity (e.g. `src/oxlint/`) |
| `scripts/`  | one-shot probes and root tooling entry points                            |
