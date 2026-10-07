# AD-70: Editor tooling — introspection first, no language server yet

**Date:** 2026-10-06
**Status:** Accepted — substrate landed (`@blue/inspect` manifest v1, config
JSON Schema, two lint rules); a language server is deferred with explicit
revisit triggers.

## Context

TypeScript already provides types, hover, and JSDoc for framework code. The
features only a bespoke language server could add are: route ↔ handler
navigation and rename, mapping-conflict diagnostics, config-key
completion/validation across `config/application.json` + environment + CLI
args, DI token/bean graphs, and embedded-language support for EJS templates.

Two facts bound the decision:

1. **The diagnostics half already ships.** `@blue/oxlint-plugin` is a
   type-aware rule pack (AD-45/46) enforced with `--deny-warnings` in CI —
   a proto-language-server at near-zero protocol cost.
2. **The semantics an LSP would encode are still moving.** In the 48h before
   this record: 406-vs-404 negotiation, view-name validation, island
   resolver defaults, error-mapping hierarchy, the relaxed-binding fix,
   secret redaction, session-cookie identity, and DSD island rendering all
   changed (commits `0c4becbd`, `60d601ca`, `4ee4a41f`). Tooling built last
   week would have encoded the broken `relaxed` binding path and missed the
   new mapping/view semantics. Stable tiers exist — decorator metadata
   contracts (AD-34/44), the property-source model (AD-11..17), `RouteRegistry`
   (AD-61), the management registry, the OpenAPI metadata pass — but the
   user-facing conventions above them are not frozen, and every package is
   still `0.0.1` with no semver window.

An editor language server is also a permanent commitment beyond diagnostics:
an LSP implementation, per-editor clients, embedded-language work of
Volar-scale complexity for templates, and a release cadence that must track
the churn above. Angular/Vue/Svelte language services exist because templates
are their first-class surface; NestJS ships none. BlueJS's nearest real need
is _introspection_, which is CLI/artifact-shaped, not server-shaped.

## Decision

- **D-1 — No language server before 1.0 + one stability window.** The gate is
  a tagged 1.0 with a semver/deprecation policy and one release without
  breaking changes to the surfaces an LSP would encode (routes/mappings,
  config keys, view resolution, token registry).
- **D-2 — Build the substrate now (landed with this record):**
    - `@blue/inspect` — `inspectApplication(input)` produces a deterministic,
      versioned JSON manifest (`version: 1`): `app`, `routes`, `mappings`
      (pattern, methods/socket, handler class + method, parameters), and
      `config` (declared keys, type, origin, `hasValue` — **never values**, so
      manifests cannot leak secrets). A demo script (`apps/blue-api` `inspect`)
      prints it; a full `@blue/cli` bin remains a separate roadmap item.
    - Config JSON Schema — `packages/blue-boot/schema/application.schema.json`
      covering the framework keys that exist today, permissive by design
      (`additionalProperties: true`), with the `{cipher:…}` secret marker
      modeled; referenced from `.vscode/settings.json` for
      `**/config/application*.json` so every editor with JSON-Schema support
      gets completion/validation today.
    - Lint rules — two newly-frozen semantics encoded as diagnostics:
      `no-unsafe-view-name-literal` (the DSV-SEC-1 view-name guard) and
      `no-duplicate-mapping-path` (the dispatcher/radix registration model).
- **D-3 — LSP v1 scope when triggered:** manifest-driven and editor-agnostic —
  route/mapping go-to-definition and rename, config-key completion and
  diagnostics, hover docs — as a standalone language server with a thin VS
  Code client. EJS embedding is deferred; AD-69's typed-web-component
  direction makes that the strong long-term template surface.
- **D-4 — The manifest is the contract.** The LSP, a future CLI, docs, and
  CI consumers all read `@blue/inspect`'s output; breaking shape changes bump
  `version`.

## Rationale

- It captures the LSP's data source without paying the protocol/client cost,
  and it is useful immediately (CI audits, docs, route/config review).
- The config schema is the highest-ROI editor artifact available today
  because the config format is JSON-only by AD-13 — one file gives
  completion/validation in every editor.
- Pushing semantics into oxlint rules keeps diagnostics in the lane that is
  already shipped, type-aware, and CI-gated.

## Consequences and residuals

- No editor navigation for routes/mappings/config yet; diagnostics remain
  lint-only.
- Manifest v1 covers routes, mappings, and config keys. DI token/bean
  enumeration and ORM entity discovery are **not** included: the factory
  registry exposes no enumerator today, and entity metadata needs either a
  registration list or a new seam. Both are prerequisites for LSP v1's token
  graph if that scope survives.
- The schema is intentionally permissive and hand-maintained; generating it
  from `@configurationProperties`/`@environment` schemas is a follow-up once
  those metadata seams are public.

## Revisit triggers

- 1.0 tagged with a semver/deprecation policy and one stability window.
- The manifest shipping and remaining shape-stable for one release.
- First external adopter demand for editor navigation (or a contributor
  offering to maintain a language server).
- Oxlint rule growth plateauing while semantic churn continues (i.e. rules
  can no longer express the constraints teams need).

## Evidence

- Substrate commit: the batch following `4ee4a41f` (`@blue/inspect`,
  `packages/blue-boot/schema/application.schema.json`, two oxlint rules,
  `.vscode` wiring).
- Diagnostics substrate: `packages/blue-oxlint-plugin` (12 rules + 2 new),
  AD-45/46.
- Churn evidence: `0c4becbd` (dispatcher/views semantics), `60d601ca` (app
  bundles + todo seeding), `4ee4a41f` (DSD islands, AD-69).
- Prior art checked: NestJS ships no language server; Angular/Vue/Svelte
  language services exist for first-class templates.
