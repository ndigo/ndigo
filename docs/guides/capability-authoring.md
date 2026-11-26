# Capability Authoring

Packages give you code; capabilities give an agent a repeatable way to install and verify a feature. A capability is data — the CLI executes it, skills coordinate it, and `ndigo verify` proves the outcome against a live application.

**Use for:** authoring new capabilities for the catalog.

**Not for:** installing capabilities; use `ndigo add` ([Capabilities for Authoring Agents](capabilities-for-authoring-agents.md)) for that.

This guide covers the entry schema, directory layout, templates, checks, and the gates a capability must pass before shipping.

**Audience:** framework authors adding capabilities to the catalog ·
**Prerequisites:** [Capabilities for Authoring Agents](capabilities-for-authoring-agents.md) ·
**Reference package:** `packages/ndigo-cli`

## What you'll learn

- The entry schema and the directory layout.
- The package manifest back-reference and how the derived facts regenerate.
- Templates and their variable contract.
- Declared checks and their target vocabulary.
- The gates a capability must pass before it ships.
- The freshness checklist that keeps shipped capabilities current.

## 1. The entry and its layout

One directory per capability, named after the id, under
`packages/ndigo-cli/assets/capabilities/`:

```
shared-cache/
├── capability.json
└── templates/
    └── cache.ts.tmpl
```

| Field       | Rule                                                                         |
| :---------- | :--------------------------------------------------------------------------- |
| `id`        | kebab-case, **identical to the directory name**                              |
| `summary`   | one line, 1–160 characters, the user-goal wording                            |
| `packages`  | the `@ndigo/*` packages the capability composes (≥1)                         |
| `guide`     | a guide slug from the shipped docs index (e.g. `jobs-and-outbox`)            |
| `skill`     | optional coordinating skill id (skills live in `ndigo-skills`)               |
| `variables` | optional; camelCase names, optional `default`, resolved by `ndigo add --var` |
| `ops`       | `addDependency` / `writeFile` / `editJson` — strict objects, no extras       |
| `checks`    | declared check ids or `id:target` references                                 |

The schema is enforced with zod in
`packages/ndigo-cli/src/capabilities/catalog.ts`; `ndigo capabilities check`
reports every violation at once.

## 2. Scaffold, then declare the back-reference

Start from the generator so the entry is schema-conformant:

```bash
pnpm exec nx g @ndigo/generators:capability \
  --id=realtime \
  --summary="Realtime fan-out over WebSockets with rooms and a heartbeat." \
  --packages=@ndigo/socket \
  --guide=websockets
```

A capability and its packages reference each other in **both directions**, and
both directions are validated: the entry's `packages` must name packages whose
manifest `ndigo` block lists the capability, and vice versa. So the second step
is the package's own manifest:

```json
"ndigo": {
  "capabilities": ["realtime"],
  "surfaces": ["socket-sessions", "rooms", "heartbeat"]
},
```

Then regenerate the derived facts — they are generated files, never edited by
hand:

```bash
pnpm agent-content:build   # packages.json, docs-index.md, per-package llms.txt
pnpm agent-content:check   # the CI gate over the same outputs
```

## 3. Templates and their variable contract

A `writeFile` op copies a template into the application and substitutes
`{{variables}}`:

- `appName` is built in — the scoped package name's last segment (`@fixture/app`
  → `app`).
- Every declared variable must appear in some template, and every `{{…}}` in a
  template must be declared; the catalog check fails both directions.
- Templates are **application code**: follow the app conventions (TSDoc module
  headers, explicit registration), never connect at construction time, and keep
  lifecycle explicit (the jobs runner starts on demand, the cache connects on
  first use).
- A capability cannot edit the application's own source — templates add new
  files (`editJson` reaches only JSON). Write the template so the app adopts it
  by adding one class to its assembly, and say so in the template's header
  comment.

## 4. Declared checks

The check vocabulary lives in `checks.json` (with each check's summary and, for
checks that take one, its **target** vocabulary — `mcp-stdio` → `tools/list`,
`route-parity` → `*`). A capability's `checks` reference them as `id` or
`id:target`; catalog validation rejects unknown ids _and_ unknown targets.

- A **named** capability (`verify --capability <id>`) makes every declared check
  required: a missing script fails instead of skipping.
- `--full` adds the app's `typecheck`, `test`, and `lint` lanes on top.
- Adding a new check id means: a runtime implementation in
  `packages/ndigo-cli/src/capabilities/verify.ts`, a `checks.json` entry, and
  targets where the check takes one.

## 5. The gates

A capability ships only when all of these are green:

1. `ndigo capabilities check` — schema, references, template variables.
2. The integration fixture — `packages/ndigo-cli/test/capabilities-integration.spec.ts`
   applies the capability to the fixture app and boots the applied wiring. The
   fixture _adopts_ what it applies (see `inspect.ts` and `jobs-smoke.ts` there);
   a template referencing a removed API fails here, which is the designed catch.
3. `pnpm agent-content:build && pnpm agent-content:check` — the derived facts,
   the agent docs index, and the per-package `llms.txt` files.
4. `pnpm docs:links`, `pnpm format:check`, `pnpm lint` — the standard lanes.

## 6. Keeping current

The fixture is the freshness contract: it boots what the capability writes.

- **A package surface changed** → re-run the fixture lane
  (`pnpm capability:smoke`) and `ndigo verify` against a real app. A stale
  template fails loudly.
- **A check's target vocabulary changed** → update `checks.json` and the
  runtime; the catalog check catches capabilities naming retired targets.
- **A guide was renamed** → update `capability.guide`; the slug
  reference is validated against the shipped docs index.
- **The user-goal wording drifted** → update the `summary`; it is what agents
  and humans read first.
- **The catalog grew** → update the count assertions in
  `packages/ndigo-cli/test/capabilities.spec.ts` (they pin the shipped set).

## 7. Worked example: `shared-cache`

`shared-cache` composes `@ndigo/redis`, links [Persistence & Shared Stores](persistence-and-shared-stores.md), declares one variable
(`namespace`, default `app`), and runs two ops: add the dependency, write
`src/cache.ts` — a `CacheConfiguration` whose `@entry(CACHE_MANAGER)` replaces
the framework's memory default with the Redis-backed manager. The fixture boots
the applied configuration, so `app-boot` exercises the constructor and the
namespace validation. `background-jobs` ([Background Jobs](jobs-and-outbox.md)) follows the same shape with a
sample `@jobHandler` worker and an explicit `startJobs` helper — see both
directories for the reference implementations of every rule above.

## See also

- [Capabilities for Authoring Agents](capabilities-for-authoring-agents.md):
  the layer, the verbs, and the verification model.
- [The Ndigo CLI](ndigo-cli.md): every verb the capability machinery
  sits behind.
- [Agent-First](../architecture/agent-first.md): the concept this authoring
  loop serves.
