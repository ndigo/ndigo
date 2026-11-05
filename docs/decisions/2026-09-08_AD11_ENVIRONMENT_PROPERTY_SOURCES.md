# AD-11: Environment property sources — named, ordered, JS-native (Phase 0)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D8 + Q1–Q7 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE0.md`

## Background

BlueJS's `Environment` (blue-context) models the reference environment: profiles +
`PropertyResolver` over an ordered list of `JSONObject` property sources. The
current shape is a thin port:

- `AbstractEnvironment.propertySources: JSONObject[]` get/set, backended by
  `PrototypalPropertyResolver` (prototype-chain of source objects).
- The getter returns the **live internal array** — callers that `push` without
  re-assigning silently get stale lookups (the boot footgun at
  `application.ts:138-141` works only because it re-assigns).
- Lookup allocates per call: `parseKeypath` builds a fresh token array.
- `NodeEnvironment` docstring says `process.env` is the primary source but the
  code makes custom sources win; the backing is the live getter-bound
  `process.env`, not a snapshot.
- No per-key origin, no named sources, no reordering API.

The reference semantics are the target, but its implementation (iterate a source
list, two virtual calls per source, per lookup) is a Java-shaped structure.
BlueJS reads configuration per-request/per-render, so allocation count and
lookup cost matter. Phase 0 ports _semantics_ with JavaScript-native
structures; a research pass (documents in the plan §3) compared object
property access vs `Map` vs radix/ART vs QP-trie vs HAMT vs codegen accessors
and rejected every exotic or eval-family candidate on security or evidence
grounds.

## Decision

**D1 — One minimal `PropertySource` shape.** `{ name, properties: JSONObject,
getProperty(key), containsProperty(key) }`, plain-object backed,
`wrapSource(name, obj)` factory. No abstract class zoo; anonymous objects
entering via legacy APIs get stable auto-names (`source:0`, `source:1`, …).
`wrapSource` captures the object (spread into a null-prototype copy) so
pollution (`__proto__` keys) and post-registration mutation surprises are
impossible; sources are replaced, not mutated.

**D2 — `PropertySources` read interface + `MutablePropertySources` class**
(an exact-parity pair, mirroring the repo's `PropertyValues`/
`MutablePropertyValues` port). `Map<string, PropertySource>` backing gives
O(1) name ops; a lazily rebuilt array serves order iteration;
`addFirst/addLast/addBefore/addAfter/remove/replace`. `replace` keeps
position; `addFirst/addLast` on an existing name repositions it (documented).
**Error semantics:** `addBefore`/`addAfter` with an unknown anchor throw
`IllegalStateError` naming the anchor and listing registered names
(`remove`/`replace` return booleans; `addFirst`/`addLast` never throw).
Mutations bump a version counter; the resolver rebuilds its index lazily on
the next lookup (dirty-flag semantics — bursts cost one rebuild).
`ConfigurableEnvironment` gains `getPropertySources(): MutablePropertySources`
(method, no collision with the deprecated getter).

**D3 — Two lookup index strategies behind one internal interface**
(`PropertyIndex`: `build/getProperty/hasProperty`, per-key origin retained).

- `PrototypeChainIndex` — today's prototype chain, extracted; compiled-key
  token cache (bounded, FIFO). Conservative default.
- `FlatMergedIndex` — compiled on invalidation: one flat null-prototype map
  keyed by canonical dot-joined paths, first source wins, with full
  shadow-prefix semantics for chain parity; zero-allocation lookups
  (canonical-key cache); per-key winning source retained for Phase 5 origin
  tracking.
- Deferred: radix keypath index (P2 prefix workloads only); codegen accessors
  — **excluded** (D8).

**D4 — `NodeEnvironment` behavior kept, docstring fixed.** Custom constructor
sources stay higher-precedence than `process.env` (tests pin this); the
docstring is corrected; `process.env` is registered under the name
**`systemEnvironment`**.

**D5 — Public surface unchanged.** `Environment` → `PropertyResolver` +
registry is identical everywhere; only the internal default index differs per
platform class; explicit `{ index: 'flat' | 'prototype' }` override.

**D6 — Bench-gated, platform-split default, no magic thresholds.** The bench
(`property-lookup.bench.ts`) answers one question — which single strategy —
against a pre-committed representative workload (layered, 8 sources, 25%
overlap, ≥ 100 merged keys, hit-heavy, median ns/op with outlier trimming).
`FlatMergedIndex` becomes the Node default **iff** it wins by ≥ 10% median,
no matrix cell regresses ≥ 10%, and the sustained 1%-mutation case stays
within margin; ties go to prototype (today's behavior). Browser and
`StandardEnvironment` default to prototype (no non-V8 evidence; V8-only bench,
documented). No key-count threshold, no auto-upgrade, no runtime engine
detection (Q7 — the package boundary is the platform signal; detection is
untestable in CI and fragile).

**D7 — `NodeEnvironment` snapshots `process.env` at construction** (spread
copy; a `__proto__`-named env var cannot pollute), replacing the live
getter-backed binding: monomorphic access + 12-factor replace-not-mutate
contract. Flagged behavior change: post-construction `process.env` mutation
is invisible until **`refresh()`** — a first-class method shipping in P0
(`getPropertySources().replace('systemEnvironment', {...process.env})`, keeps
position, invalidates the index). In-repo production code reads `process.env`
directly (grep-verified), so blast radius is zero; the contract is set before
`NodeEnvironment`'s first real adopter (Phase 2 wiring).

**D8 — No eval-family / codegen anywhere in Phase 0.** `new Function`/`eval`
/string-compiled accessors are excluded regardless of bench results — CSP
(`unsafe-eval`), static scanners, and bundle audits outweigh projected
speedups at this workload. Any future eval-family candidate ships only with:
measured evidence of persistent poor performance, an explicit opt-in, a
security review, and never in `blue-platform-web`.

**Compatibility (Q1/Q3):** the old `propertySources: JSONObject[]` get/set is
kept **indefinitely** as a deprecated alias — setter = replace-all (registry
clear + add), getter returns a fresh snapshot copy each call (mutating it is a
documented no-op, killing the push-then-reassign footgun). All in-repo
callers migrate to the registry (boot `addLast`; `merge` composes registries;
`processPropertySource` keeps using the sanctioned replace-all setter).

## Consequences

- New modules in `@blue/context`: `property-source.ts`, `property-sources.ts`;
  `property-resolver.ts` refactored onto the strategy interface; `environment.ts`
  wires the registry; `node-environment.ts` gains `systemEnvironment` (named)
    - `refresh()`; boot's `_configurePropertySources` migrates to `addLast`.
- New bench artifact `property-lookup.bench.ts` with committed protocol and
  published numbers (deliverable, not decoration).
- Behavior changes (pre-1.0, accepted): post-boot `process.env` mutation
  invisible until `refresh()` (D7); `propertySources` getter snapshot
  semantics (Q3-A); `NodeEnvironment` docstring corrected to match tests (D4).
- Parity contract: both strategies return identical query results on
  identical registries (property fuzz over hit/miss/nested/32-source
  overlaps); divergence limited to the documented replace-not-mutate rule.
- Security posture: no eval-family code anywhere in P0; `__proto__` pollution
  impossible (null-prototype copies throughout); future eval-family candidates
  require a security review.

## Revisit Trigger

Revisit if: (a) P0/P1 benches show persistent poor performance at the target
workload (evaluate the postponed radix keypath index for prefix workloads, or
an eval-family candidate under D8's gates); (b) real non-V8 browser-engine
evidence appears (flip the browser default per D6's rule — a package-constant
change, not an API change); (c) a user requirement needs browser allow-list
prefix exposure (P2 `exposePrefix` — revisit radix); or (d) Phase 5 origin
tracking finds the retained per-key winner insufficient.
