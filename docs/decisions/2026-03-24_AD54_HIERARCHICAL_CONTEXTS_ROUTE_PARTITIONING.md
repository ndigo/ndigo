# AD-54: Hierarchical shell/feature contexts with explicit event-gateway isolation and route partitioning

**Date:** 2026-03-24
**Status:** Accepted — implemented (plan marked Complete); extended by
AD-18 (host orchestration) and [AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) (view-resolution strategy).

## Context

Scale 1 (TodoMVC) used a single flat `ApplicationContext`. Scale 2 targets
multi-context, micro-frontend-style applications: a site shell context that
owns shared infrastructure (router, dispatcher, telemetry, theme/language)
plus isolated feature contexts owning feature services, view targets, and
local events. The open problems were event leakage across features, route
ambiguity between shell and feature, and predictable lifecycle teardown.
The decision: reuse the existing parent/child `ApplicationContext` tree and
make cross-context communication explicitly allowlisted.

## Evidence

- Plan: `docs/plans/2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md` —
  topology, event-isolation rules, routing model, phased implementation
  (3.1–3.3), risks, success criteria; all 15 listed primitives documented as
  landed.
- Hierarchical contexts + gateway: `packages/blue-context/src/context-hierarchy.ts`,
  `event-gateway.ts`, `feature-context-mount-manager.ts`, exported via
  `packages/blue-context/src/index.ts` (`export * from './context-hierarchy'`,
  `'./event-gateway'`, `'./feature-context-mount-manager'`).
- Partition routing: `packages/blue-router/src/partition-router.ts`,
  `feature-routing-registry.ts`, `route-partition.ts`, exported via
  `packages/blue-router/src/index.ts` (`./feature-routing-registry`,
  `./route-partition`, `./partition-router`).
- `ContextToken<T>` typed tokens re-exported from `@blue/factory`
  (`packages/blue-context/src/index.ts:28`).

## Decision

- **D-1 — context topology: parent/child `ApplicationContext` tree;**
  `createShellContext`/`createFeatureContext` build it; traversal helpers
  `traverseToRoot`/`traverseSubtree`/`findAncestor`/`findDescendants`.
- **D-2 — event isolation is local-first by default:** feature events are
  handled inside the feature context; no broadcast/bubble out unless
  relayed (prevents coupling and event storms).
- **D-3 — cross-context events use an explicit, allowlisted gateway:**
  `ContextEventGateway` relays only registered source→target pairs;
  `ContextEventGatewayOptions` adds a `NamespaceRelayValidationStrategy`
  enforcing `site:*`/`<feature>:*` contracts, blocked-relay tracking
  (`blockedRelays`, `hasBlockedRelays`) with optional
  throw-on-invalid (`InvalidRelayError`), and relay metric counters
  (`activeRelayCount`, `blockedRelayCount`, `relayedEventCount`).
- **D-4 — route composition by prefix partition:** shell resolves a
  feature-mount prefix (`/todo/**`, `/account/**`, `/reports/**`);
  feature routers own only the sub-route within the partition.
  `PartitionRouter` mounts feature callbacks on prefixes;
  `normalizePartitionPrefix`/`matchesPartitionPath`/`stripPartitionPrefix`/
  `restorePartitionPrefix` map shell↔feature routes.
- **D-5 — lifecycle teardown policy:** `unmountFeatureContext(feature, policy)`
  with `preserve` (warm-cache, default) and `close` (recreate on next mount)
  policies; `FeatureContextMountManager` orchestrates
  mount/unmount/remount; `ApplicationContext.close()` cascades to children.
- **D-6 — feature activation policy:** `FeatureRoutingRegistry` with
  `setActiveFeature(name)` and configurable activation policy (`tracked`
  default, `exclusive` deactivates non-target features).
- **Out of scope (this phase):** distributed runtime federation/loading,
  cross-tab/shared-worker event buses, SSR/edge rendering.

## Consequences

- Feature contexts mount/unmount without cross-feature event bleed
  (default-deny + allowlisted relay).
- Shell composes multiple feature routers under stable route partitions;
  feature-local `router.refresh()` updates only the feature's render flow.
- Unmounted features tear down listeners/resources cleanly.
- The demo (`apps/blue-demo` shell composition) wires `site-shell` +
  `todo`/`account` features and route-driven unmount via the mount manager.

## References

- Plan: `docs/plans/2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md`
- Implementation: `packages/blue-context/src/{context-hierarchy,event-gateway,feature-context-mount-manager}.ts`;
  `packages/blue-router/src/{partition-router,feature-routing-registry,route-partition}.ts`
- Related: [AD-03](2026-09-07_AD03_SITE_PAGE_MODEL.md) (Site lineage),
  [AD-18](2026-09-13_AD18_HOST_RUNTIME.md) (host orchestration),
  [AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) (2026-09-06, view-resolution strategy)

## Revisit Trigger

Revisit when a distributed/federated loading or cross-tab/shared-worker
event bus requirement emerges — both were explicitly out of this phase's
scope.
