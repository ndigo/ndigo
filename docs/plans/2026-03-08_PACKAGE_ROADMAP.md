# 2026-03-08 Package Roadmap

## Objective

Define near-term roadmap direction for package evolution after `@ndigo/logger` removal, with focus on:

- `@ndigo/telemetry` consolidation
- planned `@ndigo/orm`
- planned `@ndigo/auth`
- planned `@ndigo/eslint-plugin`

## Current State

- `@ndigo/logger` removed from active packages
- `@ndigo/telemetry` now provides tracing/metrics/logging bridge APIs
- Root and package documentation updated to reflect telemetry transition

## Roadmap Streams

### 1) Telemetry Consolidation (Short-term)

**Goal:** Make `@ndigo/telemetry` the single supported logging/observability path.

**Status:** Completed ✅

Delivered:

- Expand real package/app integrations (starting with `ndigo-demo`)
- Add migration examples from old logger-style usage to telemetry logger APIs
- Finalize API polish around severity schemes and context-aware logging
- Add docs/reference for recommended production OTel setup patterns

Success criteria:

- At least one app flow emits trace + metric + log with correlated context
- No root/package docs reference removed `@ndigo/logger`

### 2) `@ndigo/orm` (Medium-term)

**Goal:** Introduce persistence abstraction aligned with ndigo patterns.

**Status:** MVP implemented ✅

MVP delivers:

- Repository + Data Mapper pattern with in-memory adapter
- TC39 Stage 3 decorators: `@entity`, `@column`, `@primaryColumn`, `@generated`
- `DataSource`, `EntityManager`, `Repository<T, ID>`, `UnitOfWork` interfaces
- `InMemoryDataSource`, `InMemoryEntityManager`, `InMemoryRepository`, `InMemoryUnitOfWork` implementations
- Auto-generated primary key IDs
- Full test coverage (52 tests)

See [2026-03-30_ORM_MVP.md](2026-03-30_ORM_MVP.md) for detailed design.

Post-MVP scope:

- Relation decorators (`@oneToMany`, `@manyToOne`, etc.)
- Query builder / query derivation
- Entity lifecycle hooks (`@prePersist`, `@postLoad`, etc.)
- `@transactional` decorator
- Transaction boundary helpers
- Adapter pattern for backing stores (SQL/NoSQL) — `@ndigo/orm-drizzle`, `@ndigo/orm-mikro`
- `@ndigo/validate` integration for entity validation

Design constraints:

- ESM-only
- Strong package boundary discipline
- Avoid premature abstraction (Rule of Three)

### 3) `@ndigo/auth` (Medium-term)

**Goal:** Provide framework-level authentication/authorization components.

Proposed scope:

- Authentication strategy interfaces
- Request/route authorization hooks
- Principal/session abstractions
- Integration points for `@ndigo/http`, `@ndigo/dispatcher`, and router layers

Design constraints:

- Policy-driven architecture (strategy/handler suffix conventions)
- Minimal coupling to concrete token/session implementations

### 4) `@ndigo/eslint-plugin` (Short-medium term)

**Goal:** Encode ndigo conventions as enforceable lint rules.

**Status:** Implemented ✅

Delivers three rules:

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
- Open MVP design docs for `@ndigo/auth` and `@ndigo/orm`
- Add a post-stabilization architecture checkpoint for `@ndigo/factory` to evaluate splitting `AbstractFactoryBase` and `AbstractScopedFactory` once real non-scoped usage requirements are known
