# AD-87: OpenFeature bridge — adopt the standard behind the `FlagEvaluator` SPI

**Date:** 2026-11-01
**Status:** Accepted (Phase 1 in the 1.0 cycle; Phase 2 demand-driven)
**Deciders:** Framework owner (2026-11-01 OpenFeature reconciliation review —
session `OpenFeature-1`; AD-82 D-6 is the deferred seam this record honors)

---

## Context

AD-82 shipped `@ndigo/flags` with the **OpenFeature vocabulary** deliberately in
place (reasons, error codes, targeting context, never-throw evaluation) but
with no OpenFeature dependency: D-6 decided "OpenFeature compatibility is a
provider-seam, not a runtime", listing the follow-up bridge as additive and
citing the SDK's then-rolling spec conformance. That review judged the
ecosystem immature and the dependency surface unacceptable for the leaf
package.

The 2026-11-01 reconciliation review re-read the ecosystem against the
shipped SPI and found the terms of D-6 materially changed:

- **The specification's consumed sections are stable.** Spec **v0.9.0**
  (2026-07-24) marks §1 (flag evaluation API) and §2 (provider) **stable**;
  §3–5 (context, hooks, events) are _hardening_ and the isolated-API/tracking
  sections _experimental_. OpenFeature is CNCF **Incubating**, with six
  platform flag services shipped mid-2026 (Datadog, Vercel, Cloudflare, …).
- **The JS SDKs are stable-major.** `@openfeature/core@1.12.0`,
  `@openfeature/server-sdk@1.23.0`, `@openfeature/web-sdk@1.10.0`. The
  v0.9.0 compliance sweep is still open across SDKs ([js-sdk#1441]),
  which means **minor releases can carry provider-facing breaking changes**
  (notably: providers now emit their own status events; an error in an
  `after` hook downgrades to the default; `DISABLED` is a successful
  evaluation). We consume the _client_ API — the stable section — so the
  exposure is bounded, but pinning is part of this decision.
- **A DI-framework precedent exists.** `@openfeature/nestjs-sdk@0.2.7`
  injects clients (`@OpenFeatureClient`), a context factory, and a
  route gate (`@RequireFlagsEnabled`) — structurally the closest analogue to
  `@whenFeature` + `FLAG_EVALUATOR`, confirming the integration shape.
- **Reach is the payoff.** Community providers (flagd, OFREP, Go Feature
  Flag, Flipt, Flagsmith, GrowthBook, …) and vendor providers (LaunchDarkly,
  PostHog, Pendo, Unleash beta, …) make one adapter — not one integration
  per vendor — the whole vendor story. OFREP is the vendor-neutral HTTP
  protocol (v0.3.0 adds SSE push; JS SSE still pending, [js-sdk-contrib#1498]).

The framework's SPI is already a near-isomorph of the OpenFeature client API
for the server case: async `evaluate`, never-throw, `{value, reason?,
variant?, errorCode?, errorMessage?}` vs `EvaluationDetails` (plus
`flagMetadata`), the same reason/error vocabularies, and a
`{targetingKey, attributes}` context vs `EvaluationContext`.

## Evidence

- `packages/ndigo-flags/src/flag-evaluator.ts` — the SPI vocabularies and
  never-throw contract; `property-flag-provider.ts` — the local provider;
  `packages/ndigo-platform-node/src/feature-gate-interceptor.ts` — the gate
  (targeting seeded from `route.remoteAddress` today).
- AD-82 D-6 and the deferred item in
  `docs/plans/2026-10-10_FEATURE_FLAGS.md` ("OpenFeature SDK bridge
  provider — the SPI is the seam").
- The 2026-11-01 research briefing (session `OpenFeature-1`): spec v0.9.0
  section statuses; `ResolutionDetails`/`EvaluationDetails` fields; the
  reason/error lists; server (async) vs web (sync) provider signatures;
  provider statuses/events; hooks (incl. `hookData`); events; MultiProvider
  built into the SDKs (standalone deprecated); OFREP v0.3.0; provider-TCK
  v0.1.0 (2026-10-16, experimental, "ships ahead of" its normative text);
  NestJS SDK; provider ecosystem scan.

## Decision

### D-1 — The SPI stays the contract; the standard arrives behind it

Apps keep `FlagEvaluator`, `FLAG_EVALUATOR`, and `@whenFeature`; vendor reach
is a **bean swap** to an OpenFeature-backed evaluator. `@ndigo/flags` remains
SDK-free — the dependency lives only in the bridge package (the
`@ndigo/telemetry` → `telemetry-node` split, applied to flags). The
never-throw contract is preserved at the bridge boundary: SDK surprises
resolve as the caller's default with `GENERAL`.

### D-2 — `@ndigo/flags-openfeature` — Node-first, web recorded not built

A new package ships the server evaluator bridge:
`OpenFeatureFlagEvaluator implements FlagEvaluator` (`kind: 'openfeature'`)
over an OpenFeature **client** — options `{ client?, domain? }`, defaulting
to the global `OpenFeature.getClient(domain)`; evaluation maps
get{Boolean,String,Number,Object}`Details` → `FlagEvaluation`, flattening
`FlagEvaluationContext.attributes` into the OpenFeature context and passing
`flagMetadata` through. The SDKs are declared as **peers** (OpenFeature's
library guidance: avoid duplicate singletons), version-pinned via the pnpm
catalog (`~` minors), and allowlisted in the manifest gate.

The web SDK is a different animal — static context, **synchronous**
evaluation over a provider-materialized snapshot, reconciliation events
(`RECONCILING`, stale serving) — so a `/web` entry (or sibling package)
lands with a browser consumer, not speculatively (the AD-41 doctrine).

### D-3 — Additive vocabulary widening in `@ndigo/flags`

The bridge must be able to carry every standard outcome. Additive SPI
changes (the last pre-1.0 window):

- reasons: add `CACHED`, `UNKNOWN`, `STALE`;
- error codes: add `TARGETING_KEY_MISSING`, `INVALID_CONTEXT`;
- `FlagEvaluation` gains optional `flagMetadata?: Record<string, unknown>`;
- documentation: `DISABLED` is a _successful_ evaluation (default value,
  no error), never a failure.

Widening a string-literal union can require a new arm in an exhaustive
userland switch — a deliberate, compile-time signal, accepted pre-1.0.

### D-4 — Lifecycle ownership stays with the application

The application owns the OpenFeature singleton and its provider lifecycle:
`OpenFeature.setProviderAndWait(provider)` (or `setProvider`) in bootstrap is
the documented recipe; provider readiness races are the app's to settle at
that seam. The bridge's optional `close()` does **not** reset global
OpenFeature state by default (an owned-client option may close a
caller-constructed client). Provider statuses and events remain the SDK's
business — the framework consumes evaluations, and the gate keeps its
404-on-off semantics unchanged.

### D-5 — Context: invocation-level now, request-derived next

`FlagEvaluationContext` maps to the server SDK's per-call context (dynamic
context). Request-derived targeting (principal, tenant, session) is a
**platform** concern, not a bridge concern: a `FlagEvaluationContextResolver`
seam in `@ndigo/platform-node` replaces the IP-only seed (companion issue
#55; independent of the bridge and useful to the property provider's own
rollouts). The SDK's `AsyncLocalStorage` transaction-context propagator is
documented as an option, not adopted by default — the framework's context
story should not fork.

### D-6 — Verification: spec vectors in, provider-TCK out

Bridge tests run against an in-test in-memory provider plus the OpenFeature
**Gherkin spec vectors** (Appendix B; capability tags `@standard-reasons`,
`@object`, `@disabled-flags`). The provider-TCK is **not** adopted: v0.1.0,
experimental, explicitly "ships ahead of" its normative Appendix F, and a
minor bump may legitimately turn a green provider red. Revisit when it is
normative. ndigo ships **no** provider implementations — provider maturity
is the vendor's contract (flagd's JS providers still carry an experimental
badge; OFREP's JS providers are 0.x).

### D-7 — Telemetry composes through OpenFeature hooks (Phase 2)

Evaluation telemetry — `feature_flag.*` semconv (key, provider, variant,
reason counters) into `@ndigo/telemetry` — ships as an OpenFeature **hook**
in the bridge. Hooks are the standard's sanctioned extension point; this is
where the OpenFeature and OpenTelemetry adoptions compose. Deferred with
Phase 2 (no consumer in Phase 1).

## Alternatives considered

- **Depend on the SDK inside `@ndigo/flags`.** Rejected (reaffirming D-6,
  more strongly): forces the SDK + singleton governance on every app,
  including property-only ones; adapter packages own peers by design.
- **Adopt the OpenFeature client API as the app-facing surface.** Rejected:
  the typed, async, never-throw SPI is the framework surface, shared by DI
  wiring and `@whenFeature`; the OpenFeature client is an implementation
  detail behind the bean.
- **Provider-direction only (Ndigo as an OpenFeature provider).** Rejected
  as a deliverable: we vend no evaluation engine. Recorded as a possible
  test aid — running OF vectors against `PropertyFlagProvider` via a reverse
  adapter (Phase 2 §4).
- **Gate on spec 1.0 / full SDK v0.9.0 compliance.** Rejected as a gate,
  mitigated by pinning: the consumed section is stable, the change is
  additive, and the watchlist is explicit. Waiting buys nothing the pin
  policy does not.
- **OFREP as the only remote path.** Rejected: OFREP providers are ordinary
  providers; the bridge reaches them (and flagd, and vendors) uniformly.
  The guide documents the recipes, not a special case.
- **Build the web bridge now.** Deferred (D-2): sync-snapshot semantics are
  a different design; no consumer exists. Recorded in Phase 2.

## Consequences

- Vendor flagging becomes: install the bridge + a provider, await
  `setProviderAndWait`, override the `FLAG_EVALUATOR` bean. App code —
  including `@whenFeature` routes — is unchanged.
- `@ndigo/flags` grows three reasons, two error codes, and one optional
  field; `PropertyFlagProvider` behavior is untouched.
- New dependency surface only where opted in: the bridge package plus its
  peer SDK (app-installed, catalog-pinned); manifest peer-allowlist entry;
  no `@openfeature/*` import outside the bridge.
- Watchlist (pin reasons, revisit on minors): js-sdk v0.9.0 compliance
  ([js-sdk#1441]), provider-emitted status events, `DISABLED`-as-success,
  after-hook error defaults, provider-TCK maturity, OFREP SSE in JS.
- Docs: guide 28 §Vendors becomes a runnable recipe (in-memory, flagd,
  OFREP); the Package Map gains the bridge row; the CHANGELOG records the
  SPI widening and the new package.

## References

- AD-82 (`@ndigo/flags`; D-6 the deferred seam) and
  `docs/plans/2026-10-10_FEATURE_FLAGS.md` (bridge follow-up item).
- `docs/plans/2026-11-01_OPENFEATURE_BRIDGE.md` — Phase 1 (#56) /
  companion (#55) / Phase 2 (#57) execution plan.
- OpenFeature: [spec v0.9.0 release][spec-release],
  [specification][spec], [js-sdk][js-sdk] (server/web SDKs, releases),
  [NestJS SDK][nestjs], [provider-TCK assets][tck],
  [OFREP protocol][ofrep], [mid-2026 update][of-blog].
- Guide 28 §Vendors — the seam this record makes concrete.

[js-sdk#1441]: https://github.com/open-feature/js-sdk/issues/1441
[js-sdk-contrib#1498]: https://github.com/open-feature/js-sdk-contrib/issues/1498
[spec-release]: https://github.com/open-feature/spec/releases/tag/v0.9.0
[spec]: https://github.com/open-feature/spec/blob/main/specification/README.md
[js-sdk]: https://github.com/open-feature/js-sdk
[nestjs]: https://github.com/open-feature/js-sdk/blob/main/packages/nest/README.md
[tck]: https://github.com/open-feature/spec/tree/main/specification/assets/provider-tck/v0.1.0
[ofrep]: https://github.com/open-feature/protocol
[of-blog]: https://openfeature.dev/blog/openfeature-mid-2026-update/
