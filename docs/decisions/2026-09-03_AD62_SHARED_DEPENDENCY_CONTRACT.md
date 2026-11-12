# AD-62: Shared-dependency contract — `@shared` + shared-dependency registry

**Date:** 2026-09-03
**Status:** Accepted — implemented; the runtime-level shared-scope contract for
micro-frontend integration.

## Context

A Ndigo micro-frontend shell may host multiple feature contexts, each with its
own entry registry. Without guardrails, two features could each register their
own copy of a singleton (router, dispatcher, auth client, telemetry) —
duplicate subscriptions, conflicting state, wasted memory. Module Federation
solves this at build level (`shared`/`shareScope`); Ndigo needs the runtime
equivalent, using its existing context-hierarchy resolution chain as the
shared-scope tree. The gap: nothing prevented a child from shadowing a
shell-wide singleton. This ADR ratifies the declaration system that AD-18's
host-runtime design references without itself deciding.

## Evidence

- `packages/ndigo-core/src/shared.ts` — `@shared` class decorator + helpers.
  Verified: `export const SHARED_KEY = 'ndigo:shared'`, `export interface
  SharedOptions { singleton?; version? }`, `export function shared(options?)`,
  `getSharedOptions`, `isShared`, and `satisfiesVersion(version, range)`.
  Born `5ebf6821` (2026-09-04).
- `packages/ndigo-context/src/shared-dependency-registry.ts` —
  `SharedDependencyRegistry` (declares shell-managed shared dependencies,
  validates feature manifests at mount time, exposes `getDependency`). Born
  `5ebf6821` (2026-09-04).
- AD-18 (`apps/ndigo-host` shell-composition.ts) registers each feature twice
  — once in the mount manager, once via `createContext` relay gateways — and
  keeps shared values behind `SHARED_DEPENDENCY_REGISTRY_TOKEN` in the shell
  `@ndigo/context` root; it references this shared-dependency contract without
  ratifying it, which this ADR does.

## Decision

- **D-1** `@shared` marks an entry class "shell-managed singleton — features
  resolve this from the parent chain, never create locally." A feature that
  registers an `@shared` entry the parent lacks gets a warning but proceeds
  (needs its own copy); duplicate `@shared` declarations in sibling features
  resolve upward instead of shadowing.
- **D-2** `SharedDependencyRegistry` (in the shell context) declares the shell
  manifest and validates feature `requires`/`optional` dependency manifests
  (with semver ranges via `satisfiesVersion`) at mount time — missing required
  deps throw, missing optional deps warn.
- **D-3** Enforcement is soft — a non-`@shared` entry with the same key still
  shadows the shell (intentional-override path preserved); version mismatches
  warn, not fail. This mirrors Module Federation's declarative, soft-checked
  model.

## Consequences

- Micro-frontend features cannot silently duplicate shell singletons;
  deployment skew (shell/feature version drift) is caught before a feature
  runs.
- `@ndigo/core` gained the `@shared` decorator; `@ndigo/context` gained the
  registry; `FeatureContextMountManager.mount()` validates feature
  dependencies through it (per the plan's §3.3 integration).
- AD-18's host-runtime composition now has its ratified dependency contract.

## References

- Plan: `docs/plans/2026-09-03_SHARED_DEPENDENCY_CONTRACT.md`
- Implementation: `packages/ndigo-core/src/shared.ts`,
  `packages/ndigo-context/src/shared-dependency-registry.ts`, commit `5ebf6821` (2026-09-04)
- Related: [AD-18](2026-09-13_AD18_HOST_RUNTIME.md)

## Revisit Trigger

Revisit if a consumer needs hard enforcement (version mismatch blocks
mounting) or a build-level counterpart to the runtime registry. Until then the
soft, declarative shared-scope model stands.
