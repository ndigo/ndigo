# Guide 39 — Quality Guardrails

Ndigo ships guardrails at three levels: lint rules that catch wrong framework
usage, an inspection manifest that answers “what does this app expose?”, and the
validation lanes that keep the repository itself honest. This guide is the map
to those checks and how to wire them into an app.

**Audience:** Application developers and framework contributors · **Prerequisites:** Workspace bootstrapped; [guide 01](01-building-a-node-api.md) or 02 · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)

## What you'll learn

- Enable the consumer lint rules and know what each one guards.
- Tell the consumer rule set from the repo-only internal rules.
- Generate and consume the application inspection manifest.
- Run the same validation lanes CI runs.
- Add a package surface without breaking the manifest/API gates.

## 1. Two rule sets

| Rule set         | Package                           | Scope                                  |
| ---------------- | --------------------------------- | -------------------------------------- |
| Consumer guards  | `@ndigo/oxlint-plugin`            | Framework API misuse in any app        |
| Repo-only guards | root `src/oxlint/` (`internal/*`) | This monorepo's layout and house style |

The split is deliberate: a rule belongs to the consumer plugin only if
it guards use of the framework API. Rules keyed to `packages/ndigo-*`, the
internal-file convention, doc headers, or repository naming stay internal.

## 2. Enabling the consumer rules

```jsonc
// .oxlintrc.json
{
    "jsPlugins": ["@ndigo/oxlint-plugin"],
    "rules": {
        "@ndigo/no-cross-paradigm-decorators": "error",
        "@ndigo/no-scheduled-in-browser": "error",
        "@ndigo/no-signals-in-entity": "error",
        "@ndigo/no-string-registry-lookup": "error",
        "@ndigo/no-unsafe-view-name-literal": "error",
        "@ndigo/no-duplicate-mapping-path": "error",
    },
}
```

| Rule                           | Catches                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `no-cross-paradigm-decorators` | Decorator families mixed outside their paradigm            |
| `no-scheduled-in-browser`      | `@ndigo/scheduler` imports in browser-platform files       |
| `no-signals-in-entity`         | `@ndigo/signals` reactivity leaking into ORM entities      |
| `no-string-registry-lookup`    | String-literal registry lookups where a token is available |
| `no-unsafe-view-name-literal`  | Absolute/`..`/NUL view names; invalid island tags          |
| `no-duplicate-mapping-path`    | Duplicate same-method mappings in one class                |

The duplicate-path rule is class-local and syntactic: it compares mapping
decorators attached to methods of one class, groups by normalized path and
resolved method identity, and skips mappings with extra conditions. It is
best-effort by design; do not rely on it to see base-class or dynamically built
paths.

## 3. The repo-only rules

The internal plugin runs from TypeScript with no build step and is loaded by the
root `.oxlintrc.json`. It enforces:

- `internal/no-direct-integration-imports` — no linkedom outside `@ndigo/dom`.
- `internal/no-internal-file-imports` / `-exports` — `_*.ts` stays private.
- `internal/no-uppercase-regexp-constants` — regex constants use the agreed form.
- `internal/no-abstract-class-without-prefix` — `Abstract*` naming.
- `internal/no-mixed-case-acronyms` — acronym casing.
- `internal/requires-doc-header` — the module summary block.
- `internal/no-global-state-in-create-factories` — `create*` stays global-free.

Run them with the same command as the consumer rules: `pnpm lint`.

## 4. The inspection manifest

`@ndigo/inspect` reads the live application and emits a deterministic JSON
description of routes, handler mappings, and declared configuration keys. It
never reads or decrypts values — only presence and the winning source — so the
manifest is safe to print and diff.

```bash
ndigo inspect ./[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)
ndigo routes ./[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)   # alias
```

```ts
import { inspectApplication } from '@ndigo/inspect';

const manifest = inspectApplication({
    context,
    routes,
    mappings: context.getValue(DISPATCHER),
    configurationClasses: [ServerConfig],
    now: '2026-01-01T00:00:00.000Z', // optional: byte-identical snapshots
});
```

Manifest shape: `version`, `app`, `routes`, `mappings`, `config`. Everything is
sorted and de-duplicated; `generatedAt` is the only run-to-run difference unless
you inject `now`. Use it for:

- a route/mapping inventory in CI or release notes;
- drift checks against a committed manifest;
- answering “which config keys does this app declare?” without reading secrets.

## 5. The validation lanes

The same commands run locally and in CI:

```bash
pnpm build           # tsc -b per package
pnpm typecheck       # per-project build + spec lane
pnpm lint            # oxlint, zero warnings
pnpm test            # unit + integration
pnpm format:check    # oxfmt
pnpm docs:links      # relative links and anchors
pnpm guides:check    # guide contract
pnpm doc:coverage    # TSDoc depth gate
pnpm doc:api         # TypeDoc, zero warnings
pnpm manifest:check  # package/README/metadata conformance
pnpm agents:check    # generated agent files
```

`pnpm doc:api` writes the per-package `api/` trees; CI compares them and fails
on drift. `pnpm manifest:check` enforces the README skeleton and package
metadata. `pnpm doc:coverage` is the zero-tolerance member-docs gate.

## 6. Adding a package or public symbol

1. Scaffold with the generators (`ndigo generate` / the package generator).
2. Fill the README skeleton and manifest fields.
3. Write TSDoc on every public symbol and member (`@param`/`@returns`).
4. Run `pnpm doc:api` and commit the generated tree.
5. Add the package to the API index and, if it has a guide, to the guide index.
6. Run the validation lanes; `manifest:check` and the docs freshness diff are
   the usual failures.

## 7. Pitfalls

- **Enabling a consumer rule as `warn` does not fail CI.** The lane runs with
  `--deny-warnings`; use `error`.
- **The internal rules are not published.** Do not reference `internal/*` from
  an app's config.
- **The manifest is not a config dump.** Values are deliberately absent; do not
  add a “show values” switch.
- **Duplicate-path lint is class-local.** A duplicate across base classes or
  dynamic paths still reaches the dispatcher.
- **Generated docs are not hand-edited.** Regenerate after API changes.

## See also

- [Guide 37 — The `ndigo` CLI](37-ndigo-cli.md) — command surface
- [Guide 90 — Package Documentation](90-package-documentation.md) — README/API standard
- [`@ndigo/oxlint-plugin`](../../packages/ndigo-oxlint-plugin/README.md) — the consumer rules
- [`@ndigo/inspect`](../../packages/ndigo-inspect/README.md) — the manifest
- — the rule-surface split
