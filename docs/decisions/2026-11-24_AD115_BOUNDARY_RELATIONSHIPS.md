# AD-115: Boundary relationships — adapter, boundary, facade, direct

**Date:** 2026-11-24
**Status:** Accepted
**See also:** AD-45 (lint plugin), AD-108 (consumer lint surface), #741 (remove `@ndigo/dom`)
**Refs:** #745 (this decision)

---

## Context

`internal/no-direct-integration-imports` was introduced to keep Ramda and
Arcsecond behind their integration packages. Both libraries are gone; the rule
remains useful because it encodes one owner per third-party surface. But it was
only half-enforced:

- it visited static imports and named re-exports, not `import()` or `export *`;
- severity was `warn`, so even a static violation passed;
- `@preact/signals-core` was imported by `@ndigo/signals` without being
  registered in the map;
- `AGENTS.md` stated the rule universally while the map had two entries.

`@ndigo/dom` (#741) exposed the opposite failure: a wrapper package with no
import site and no seam — an abstraction without a capability. A policy that
only says "wrap external dependencies" produces both failures.

## Decision

### D-1 — Four relationship kinds

| Kind     | Public surface                                             | Example                           |
| :------- | :--------------------------------------------------------- | :-------------------------------- |
| Adapter  | Upstream values at entry points; framework types elsewhere | `@ndigo/ai-sdk` / `ai`            |
| Boundary | No upstream types                                          | `@ndigo/view-toon` / TOON         |
| Facade   | Upstream API is the contract                               | `@ndigo/signals` / preact signals |
| Direct   | Normal dependency; no wrapper                              | zod, OTel, `ws`, `helmet`, …      |

The import rule enforces ownership for the first three. Direct dependencies are
not mapped and may be imported where needed.

### D-2 — The decision test

Use an adapter when a consumer must supply an upstream value; a boundary when
the framework owns the contract and the upstream is an implementation detail; a
facade when the upstream API is deliberately adopted. If none applies, do not
create a package.

### D-3 — Enforcement

The rule covers `import`, `export { … } from`, `export * from`, and `import()`.
Severity is `error`. The owner list is derived from `INTEGRATION_LAYER_MAP`; the
kind is recorded in `INTEGRATION_LAYER_KINDS` and checked by a spec.

## Consequences

- `@preact/signals-core` is registered to `@ndigo/signals`.
- The CLI encodes TOON through `@ndigo/view-toon/encode`; the raw SDK dependency
  moves to `devDependencies` (test decoder only).
- `ARCHITECTURE.md` and `AGENTS.md` scope the rule to the map and document the
  four kinds.
- New wrappers must name their integration point; `@ndigo/dom` is the precedent
  for declining one.
