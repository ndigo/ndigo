# AD-16: Environment observability & lifecycle — origins, customizers, refresh (Phase 5)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D4 + Q1–Q7 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE5.md`

## Background

P0 retained per-key winning sources in `FlatMergedIndex` _for_ this phase (the
`#origins` map + comment). P2 shipped an ad-hoc `NodeEnvironment.refresh()`
whose formalization was deferred here. The roadmap promised Spring's
`EnvironmentPostProcessor` analog (customizers) as the documented
reorder/replace seam.

## Decision

**D1 — `originOf(key)` public API.** `PropertyResolver`/`Environment` gain
`originOf(key: string): string | null`. **Q1**: `PropertyIndex` gains an
**optional** `originOf?(key)` — `FlatMergedIndex` implements it (retained
winners); `PrototypeChainIndex` leaves it absent → `null` (the chain's winner
is structural, not stored; deriving per-call adds the scan/allocation P0
avoids). Strategy-local change later, not a contract break. **Q7 granularity**:
top-level key — `originOf('server.port')` reports the source owning the
`server` subtree (the retained winner is key-level; per-segment origins would
need index rework for a rare split). `likeEnvironment` shape updated.

**D2 — `EnvironmentCustomizer` (Q3: house name, not Spring's
`PostProcessor`).** `interface EnvironmentCustomizer { customize(environment:
ConfigurableEnvironment): void }` — an ordered hook receiving the fully-wired
environment (profiles/files/CLI/builder) **before the context reads it**.
`ApplicationBuilder.customizers(...)` registers; boot applies them in
`_prepareEnvironment` after `_configureEnvironment`. **Q2 ordering**:
registration order (precedence inversion = register in reverse). **Q6**: a
throwing customizer **fails boot loudly** — a partial environment would poison
later reads (binding, conditions); Spring's `EnvironmentPostProcessor`
propagates too.

**D3 — `refresh()` formalized.** `ConfigurableEnvironment.refresh()`: clears
the resolver's placeholder cache + forces an index rebuild — **minimal scope
(Q4, option a)** ("recompute from current sources"): no customizer re-run
(double-apply footgun), no platform re-snapshot (that's the platform's own
refresh chaining). **Q5**: environment-scope only by construction (the
environment holds no context — re-binding is P4's explicit
`resolveConfigurationProperties` call).

**D4 — Origin in error messages.** Fail-loud errors (`Missing required
property …`, P3/P4) append `(from source: <name>)` when the key's origin is
known — the observability payoff where users actually see it.

## Consequences

- `originOf` on the default (prototype) environment returns `null` —
  documented; the optional index member keeps origins strategy-local.
- Customizers are the documented reorder/replace seam (replacing the ad-hoc
  mutations tests did inline); failure is loud.
- `NodeEnvironment.refresh` re-implements via `super.refresh()` + its
  re-snapshot.
- Error messages become self-diagnosing for source attribution.

## Revisit Trigger

Revisit if: (a) prototype-chain origins become a need (strategy-local
change — store winners in `PrototypeChainIndex.build`); (b) per-keypath origin
granularity is wanted (requires index rework for path-level splits);
(c) refresh needs to re-read platform snapshots (add a platform-level
refresh chaining, not scope creep on the core);
(d) customizer re-running during refresh is wanted (only with the
double-apply footgun resolved).
