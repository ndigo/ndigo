# 2026-03-08 Package Analysis

## Summary

This audit reviews the ndigo monorepo package surface, package maturity, documentation status, and near-term platform risks.

At audit time:

- **19 packages** exist in `packages/`
- **1 application** exists in `apps/` (`ndigo-demo`)
- `@ndigo/logger` has been removed and replaced by `@ndigo/telemetry`
- Root/package documentation has been corrected and expanded

## Scope

Analyzed:

- Package inventory and exported surface
- Package-level README completeness
- Dependency and architectural role distribution
- Active blockers and roadmap-level gaps

Excluded:

- Deep per-module API correctness review (handled separately in package-level work)
- Runtime benchmarking and performance profiling

## Package Inventory

| Package                    | Role                              | Maturity        | Notes                                      |
| :------------------------- | :-------------------------------- | :-------------- | :----------------------------------------- |
| `@ndigo/core`              | Foundational primitives/contracts | High            | Highest reuse across workspace             |
| `@ndigo/util`              | Integration-layer utility package | High            | Encapsulates external utility dependencies |
| `@ndigo/parser`            | Parsing integration/utilities     | High            | Stable parser abstractions                 |
| `@ndigo/http`              | HTTP client/interceptor stack     | High            | Most complete package docs/API examples    |
| `@ndigo/context`           | Application context/configuration | Medium-High     | Decorator migration completed              |
| `@ndigo/factory`           | DI/factory/lifecycle              | Medium-High     | Strong test coverage                       |
| `@ndigo/router`            | Route primitives and hash routing | Medium          | Stable core behavior                       |
| `@ndigo-dispatcher`        | Route dispatch orchestration      | Medium          | Large surface area, evolving               |
| `@ndigo/view`              | View contracts/resolvers          | Medium          | Works with dispatcher/router               |
| `@ndigo/view-webcomponent` | View/webcomponent bridge          | Low-Medium      | Thin integration layer                     |
| `@ndigo/content`           | Content/theme abstractions        | Medium          | Interface-heavy package                    |
| `@ndigo/model`             | Object modeling integration       | Medium          | Backed by `objectmodel`                    |
| `@ndigo/validate`          | Constraints/validation            | Medium          | Stable constraints APIs                    |
| `@ndigo/domain`            | Domain component abstractions     | Low-Medium      | Early-stage domain patterns                |
| `@ndigo/platform-web`      | Browser platform adapters         | Medium          | Cookie/browser helpers                     |
| `@ndigo/print`             | Fingerprinting utility            | Medium          | Narrow focused package                     |
| `@ndigo/boot`              | App bootstrapping                 | Low-Medium      | Framework wiring package                   |
| `@ndigo/service`           | Service-layer package             | Low-Medium      | Framework-level scaffold                   |
| `@ndigo/telemetry`         | OTel tracing/metrics/logging      | Medium (rising) | Replaces removed logger package            |

## Documentation Findings

### Before this audit cycle

- Root `README.md` package list referenced non-existent `ndigo-logger`
- `ndigo-boot` and `ndigo-service` were missing from root package list
- Most package READMEs were one-line stubs
- `@ndigo/telemetry` had no README

### After this audit cycle

- Root package index corrected (`ndigo-logger` removed, `ndigo-boot`/`ndigo-service`/`ndigo-telemetry` added)
- **15 package READMEs** expanded from stub to baseline documentation
- New `packages/ndigo-telemetry/README.md` added

## Architecture Findings

### Logging/Telemetry transition

- `@ndigo/logger` is removed from active package set
- `@ndigo/telemetry` now carries logging responsibility with OpenTelemetry bridge semantics
- Severity model consolidated around OTel `SeverityNumber`

### Dependency layering

- Core dependency hierarchy remains healthy: `core` + `util` + `parser` underpin most higher packages
- Integration-layer rule remains critical (no direct imports from encapsulated libraries outside integration packages)

## Active Risks / Blockers

1. **MediaType location decision (in progress)**

    - Impact: HTTP transform pipeline design and shared type ownership
    - Current status: partial analysis complete, decision still pending

2. **HTTP interceptor type conflict**

    - Impact: transform/interceptor composition APIs and type safety
    - Requires targeted resolution to avoid API churn in `@ndigo/http`

3. **Telemetry adoption risk**
    - `@ndigo/telemetry` currently has low in-repo consumers
    - Integration into additional packages is required to validate behavior in real flows

## Recommendations

1. **Finalize MediaType ownership**

    - Decide canonical package ownership (`@ndigo/core` vs package-local alternatives)
    - Publish decision in migration/reference doc

2. **Resolve interceptor typing conflict in `@ndigo/http`**

    - Add focused design + tests for transform/interceptor composition

3. **Complete telemetry migration**

    - Replace remaining conceptual references to old logger patterns in docs
    - Integrate `@ndigo/telemetry` in at least one end-to-end app flow (`ndigo-demo`)

4. **Maintain package README quality baseline**
    - Keep package READMEs aligned with API changes during feature work

## Outcome

ndigo package architecture is coherent and improving. The largest completed structural change is logger-to-telemetry migration. The next high-value technical decisions are HTTP transform typing and MediaType ownership, which will unblock cleaner API evolution across transport and view layers.
