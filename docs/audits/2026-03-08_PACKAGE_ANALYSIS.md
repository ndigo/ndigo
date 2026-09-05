# 2026-03-08 Package Analysis

## Summary

This audit reviews the BlueJS monorepo package surface, package maturity, documentation status, and near-term platform risks.

At audit time:

- **19 packages** exist in `packages/`
- **1 application** exists in `apps/` (`blue-demo`)
- `@blue/logger` has been removed and replaced by `@blue/telemetry`
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

| Package                   | Role                              | Maturity        | Notes                                      |
| :------------------------ | :-------------------------------- | :-------------- | :----------------------------------------- |
| `@blue/core`              | Foundational primitives/contracts | High            | Highest reuse across workspace             |
| `@blue/util`              | Integration-layer utility package | High            | Encapsulates external utility dependencies |
| `@blue/parser`            | Parsing integration/utilities     | High            | Stable parser abstractions                 |
| `@blue/http`              | HTTP client/interceptor stack     | High            | Most complete package docs/API examples    |
| `@blue/context`           | Application context/configuration | Medium-High     | Decorator migration completed              |
| `@blue/factory`           | DI/factory/lifecycle              | Medium-High     | Strong test coverage                       |
| `@blue/router`            | Route primitives and hash routing | Medium          | Stable core behavior                       |
| `@blue-dispatcher`        | Route dispatch orchestration      | Medium          | Large surface area, evolving               |
| `@blue/view`              | View contracts/resolvers          | Medium          | Works with dispatcher/router               |
| `@blue/view-webcomponent` | View/webcomponent bridge          | Low-Medium      | Thin integration layer                     |
| `@blue/content`           | Content/theme abstractions        | Medium          | Interface-heavy package                    |
| `@blue/model`             | Object modeling integration       | Medium          | Backed by `objectmodel`                    |
| `@blue/validate`          | Constraints/validation            | Medium          | Stable constraints APIs                    |
| `@blue/domain`            | Domain component abstractions     | Low-Medium      | Early-stage domain patterns                |
| `@blue/platform-web`      | Browser platform adapters         | Medium          | Cookie/browser helpers                     |
| `@blue/print`             | Fingerprinting utility            | Medium          | Narrow focused package                     |
| `@blue/boot`              | App bootstrapping                 | Low-Medium      | Framework wiring package                   |
| `@blue/service`           | Service-layer package             | Low-Medium      | Framework-level scaffold                   |
| `@blue/telemetry`         | OTel tracing/metrics/logging      | Medium (rising) | Replaces removed logger package            |

## Documentation Findings

### Before this audit cycle

- Root `README.md` package list referenced non-existent `blue-logger`
- `blue-boot` and `blue-service` were missing from root package list
- Most package READMEs were one-line stubs
- `@blue/telemetry` had no README

### After this audit cycle

- Root package index corrected (`blue-logger` removed, `blue-boot`/`blue-service`/`blue-telemetry` added)
- **15 package READMEs** expanded from stub to baseline documentation
- New `packages/blue-telemetry/README.md` added

## Architecture Findings

### Logging/Telemetry transition

- `@blue/logger` is removed from active package set
- `@blue/telemetry` now carries logging responsibility with OpenTelemetry bridge semantics
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
    - Requires targeted resolution to avoid API churn in `@blue/http`

3. **Telemetry adoption risk**
    - `@blue/telemetry` currently has low in-repo consumers
    - Integration into additional packages is required to validate behavior in real flows

## Recommendations

1. **Finalize MediaType ownership**

    - Decide canonical package ownership (`@blue/core` vs package-local alternatives)
    - Publish decision in migration/reference doc

2. **Resolve interceptor typing conflict in `@blue/http`**

    - Add focused design + tests for transform/interceptor composition

3. **Complete telemetry migration**

    - Replace remaining conceptual references to old logger patterns in docs
    - Integrate `@blue/telemetry` in at least one end-to-end app flow (`blue-demo`)

4. **Maintain package README quality baseline**
    - Keep package READMEs aligned with API changes during feature work

## Outcome

BlueJS package architecture is coherent and improving. The largest completed structural change is logger-to-telemetry migration. The next high-value technical decisions are HTTP transform typing and MediaType ownership, which will unblock cleaner API evolution across transport and view layers.
