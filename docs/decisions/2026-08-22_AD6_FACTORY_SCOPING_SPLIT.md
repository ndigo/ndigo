# AD-6 Resolution: @blue/factory Scoping Split

**Date:** 2026-08-22  
**Status:** Reviewed — No split needed at 1.0

## Background

AD-6 proposed splitting `@blue/factory` into a scoped and non-scoped part. The concern was that `Scope`, `ScopedFactory`, `PrototypeScope`, `SingletonScope`, `HashScope`, and `ScopeRegistry` add complexity that not all consumers need.

## Analysis

| Concern                                    | Current state                                          |
| ------------------------------------------ | ------------------------------------------------------ |
| Packages importing `@blue/factory`         | 11 packages across layers L0–L6                        |
| Packages that import scope-specific types  | 0 (scopes are used internally by `AbstractFactory`)    |
| Packages that import lifecycle/Aware types | All 11 (these are the primary interface)               |
| Size of scope code                         | ~200 lines of 834 in `scope.ts` + `_scope-registry.ts` |

Scope types are internal to the factory implementation — no external consumer imports `Scope` or `ScopedFactory` directly. The scope registry is initialized once in the `AbstractFactory` constructor and used transparently.

## Decision

**No split at 1.0.** The scoped factory remains integrated for three reasons:

1. **No consumer pressure.** Every consumer that uses `@blue/factory` either needs the full `ConfigurableFactory` (which includes scoping) or just imports lightweight lifecycle/Aware types from the same package. No consumer would benefit from a split today.

2. **No abstraction boundary.** Scoping is woven through `AbstractFactory` — `getInstance()`, `setValue()`, `destroyValues()` all interact with scopes. Extracting scopes would require significant refactoring of the core factory methods for no immediate gain.

3. **YAGNI.** A split would add an extra package, extra `peerDependencies`, and extra build time. The integration point (`ScopeRegistry` + scope implementations) is already self-contained in two files.

## Documentation

The integration point is:

- `packages/blue-factory/src/_scope-registry.ts` — scope registry
- `packages/blue-factory/src/scope.ts` — scope interfaces and implementations
- `packages/blue-factory/src/factory.ts` — `AbstractFactory` wires them in `constructor()` at line 222

If a non-scoped consumer emerges post-1.0, the extraction path is:

1. New package `@blue/factory-core` with `AbstractFactory` minus scope registration
2. `@blue/factory` re-exports from `@blue/factory-core` and adds scope support
3. Consumers that only need lifecycle/Aware types can depend on either

## Revisit Trigger

Revisit if:

- A consumer needs factory lifecycle without scoping
- The factory scope code grows beyond 500 lines
- A packaging concern (e.g., tree-shaking) makes the split valuable
