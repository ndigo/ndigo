# 2026-03-08 Package Roadmap

## Objective

Define near-term roadmap direction for package evolution after `@blue/logger` removal, with focus on:

- `@blue/telemetry` consolidation
- planned `@blue/orm`
- planned `@blue/auth`
- planned `@blue/eslint-plugin`

## Current State

- `@blue/logger` removed from active packages
- `@blue/telemetry` now provides tracing/metrics/logging bridge APIs
- Root and package documentation updated to reflect telemetry transition

## Roadmap Streams

### 1) Telemetry Consolidation (Short-term)

**Goal:** Make `@blue/telemetry` the single supported logging/observability path.

Planned work:

- Expand real package/app integrations (starting with `blue-demo`)
- Add migration examples from old logger-style usage to telemetry logger APIs
- Finalize API polish around severity schemes and context-aware logging
- Add docs/reference for recommended production OTel setup patterns

Success criteria:

- At least one app flow emits trace + metric + log with correlated context
- No root/package docs reference removed `@blue/logger`

### 2) `@blue/orm` (Medium-term)

**Goal:** Introduce persistence abstraction aligned with BlueJS patterns.

Proposed scope:

- Repository and unit-of-work abstractions
- Transaction boundary helpers
- Adapter pattern for backing stores (SQL/NoSQL)
- Integration with `@blue/context` and `@blue/factory`

Design constraints:

- ESM-only
- Strong package boundary discipline
- Avoid premature abstraction (Rule of Three)

### 3) `@blue/auth` (Medium-term)

**Goal:** Provide framework-level authentication/authorization components.

Proposed scope:

- Authentication strategy interfaces
- Request/route authorization hooks
- Principal/session abstractions
- Integration points for `@blue/http`, `@blue/dispatcher`, and router layers

Design constraints:

- Policy-driven architecture (strategy/handler suffix conventions)
- Minimal coupling to concrete token/session implementations

### 4) `@blue/eslint-plugin` (Short-medium term)

**Goal:** Encode BlueJS conventions as enforceable lint rules.

Proposed initial rules:

- Decorator naming (camelCase)
- Integration-layer imports (no direct encapsulated dependency imports)
- Internal module visibility guardrails (`_*.ts` exports/import boundaries)
- Naming conventions for transducers/roles/abstract classes

Success criteria:

- Plugin can enforce at least core architectural rules currently checked manually
- Workspace lint setup can consume plugin incrementally

## Sequencing

1. **Telemetry consolidation** (stabilize replacement for removed logger package)
2. **ESLint plugin foundation** (to lock in conventions before adding new major packages)
3. **Auth package planning/implementation**
4. **ORM package planning/implementation**

> Sequence rationale: stabilize observability + policy guardrails first, then add major cross-cutting runtime packages.

## Risks

- Incomplete telemetry adoption can fragment logging behavior
- Missing lint automation can allow drift from architectural standards
- ORM/auth abstraction scope may expand too quickly without focused MVP boundaries

## Next Actions

- Author telemetry migration reference document (examples + recommended defaults)
- Draft eslint-plugin rule specification document
- Open MVP design docs for `@blue/auth` and `@blue/orm`
- Add a post-stabilization architecture checkpoint for `@blue/factory` to evaluate splitting `AbstractFactoryBase` and `AbstractScopedFactory` once real non-scoped usage requirements are known
