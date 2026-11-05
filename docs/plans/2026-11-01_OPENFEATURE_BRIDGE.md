# OpenFeature Bridge — Phase 1 (pre-1.0) and the Phase 2 outline

**Status:** Phase 1 implemented (2026-11-01) and Phase 2's web entry +
telemetry hook implemented (2026-11-02, #57) — pre-1.0; the remaining
Phase 2 items are externally gated (see §5).
**Decision record:** [AD-87](../decisions/2026-11-01_AD87_OPENFEATURE_BRIDGE.md).
**Issues:** Phase 1 — [#56](https://github.com/ndigo/ndigo/issues/56) ·
companion targeting context — [#55](https://github.com/ndigo/ndigo/issues/55) ·
Phase 2 — [#57](https://github.com/ndigo/ndigo/issues/57).

---

## 1. Summary

1. **Adopt OpenFeature behind the existing SPI.** `@ndigo/flags` keeps
   `FlagEvaluator` / `FLAG_EVALUATOR` / `@whenFeature`; a new
   `@ndigo/flags-openfeature` package bridges an OpenFeature client into the
   SPI, so vendors (flagd, OFREP, LaunchDarkly, Unleash, …) arrive as
   providers — never as framework integrations.
2. **Widen the SPI vocabulary additively** (reasons `CACHED`/`UNKNOWN`/`STALE`,
   errors `TARGETING_KEY_MISSING`/`INVALID_CONTEXT`, optional `flagMetadata`)
   so every standard outcome survives the bridge — the last pre-1.0 window.
3. **Phase 2 records the rest:** the web entry (sync-snapshot semantics), the
   `feature_flag.*` telemetry hook, conformance follow-ups, and OFREP/flagd
   recipes once JS SSE lands.

## 2. Why now

AD-82 deferred the bridge (D-6) on "rolling SDK conformance" and dependency
surface grounds. The 2026-11-01 review found: spec **v0.9.0** with §1/§2
**stable**; JS SDKs at stable majors (`server-sdk@1.23.0`,
`web-sdk@1.10.0`); a NestJS SDK precedent mirroring our gate + DI shape; and
a broad provider ecosystem. The v0.9.0 compliance sweep is still open
(provider-facing endpoints may shift on minors) — which argues for a pinned,
additive, adapter-shaped adoption now, exactly what this plan is. Full
evidence and reasoning: AD-87.

## 3. Phase 1 deliverables (pre-1.0 — #56)

| #    | Deliverable                                                                                                                        | Where                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P1-1 | SPI widening: 3 reasons, 2 error codes, optional `flagMetadata`; `DISABLED`-as-success documented; tests                           | `packages/ndigo-flags/src/flag-evaluator.ts`, `test/`                    |
| P1-2 | `@ndigo/flags-openfeature`: `OpenFeatureFlagEvaluator` (global + domain clients), never-throw boundary, `close()` policy           | `packages/ndigo-flags-openfeature/` (new)                                |
| P1-3 | Catalog pins + peer allowlist (SDKs as peers per OF library guidance)                                                              | `pnpm-workspace.yaml`, `scripts/check-manifests.mjs`                     |
| P1-4 | Tests: in-test in-memory provider + OF **Gherkin spec vectors** (`@standard-reasons`, `@object`, `@disabled-flags`)                | `packages/ndigo-flags-openfeature/test/`                                 |
| P1-5 | Docs: bridge README, guide 28 §Vendors recipe (`setProviderAndWait` + bean override; flagd/OFREP examples), Package Map, CHANGELOG | `packages/ndigo-flags-openfeature/README.md`, `docs/`, `ARCHITECTURE.md` |
| P1-6 | Companion: `FlagEvaluationContextResolver` seam (principal/tenant → context)                                                       | `packages/ndigo-platform-node/` — **#55**, implemented 2026-11-02        |

Explicit non-goals for Phase 1: no web entry (`/web`), no telemetry hook, no
provider implementations, no provider-TCK adoption, no `@openfeature/*`
imports outside the bridge package.

## 4. Validation

- Bridge unit lane: SPI mapping for all four types; domain-scoped client;
  never-throw on a throwing provider; `flagMetadata` passthrough; flattened
  attributes; `close()` semantics.
- Spec vectors: the applicable OF Gherkin scenarios run against the in-test
  provider; capability tags recorded per scenario so skips are explicit.
- Gate sweep: `pnpm lint`, `typecheck` (build + spec lanes), `format:check`,
  `manifest:check` (peer allowlist), `doc:api` freshness,
  `docs:links`.
- Recipe smoke: the guide's recipe decomposes into the bridge mapping tests
  (this package) plus the existing gate tests (`apps/04-ndigo-api`'s
  feature-flags lane) — the interceptor evaluates through whatever
  `FLAG_EVALUATOR` bean is registered, so no new app dependency is needed.

Performed 2026-11-01 (#56): flags + bridge lanes green — 62 tests across
the SPI and the bridge, including the 11 adapted spec-vector scenarios,
the never-throw cases, and the null narrowing; build, spec typecheck,
scoped lint, format, manifest, and doc-links gates green; API trees
regenerated for both packages.

## 5. Phase 2 (#57) — web entry + telemetry hook implemented; the rest gated

1. **Web entry — implemented**: `@ndigo/flags-openfeature/web` over
   `@openfeature/web-sdk` (`WebOpenFeatureFlagEvaluator`); static-context,
   snapshot semantics documented; the same mapping, null narrowing, and
   never-throw boundary as the server evaluator; web-sdk added as the
   subpath's peer + catalog pin.
2. **Telemetry hook — implemented**: `FeatureFlagTelemetryHook` (bridge
   package) — one `feature_flag.evaluation` span per evaluation,
   `feature_flag.*` semconv attributes plus `error.type`; works on both
   SDKs; opt-in and inert without wired providers.
3. **Conformance follow-ups — still deferred**: provider-TCK adoption waits
   for its normative Appendix F (v0.1.0 is explicitly pre-normative); the
   reverse adapter (our provider as an OF provider) stays a possible
   vector-runner, not a deliverable.
4. **OFREP/flagd recipes — documented**: guide 28 notes both providers and
   their maturity badges; SSE push recipes wait on JS support
   (js-sdk-contrib#1498) — they poll meanwhile.

## 6. Risks and watchlist

- **Minor-version drift** — the v0.9.0 compliance sweep can change
  provider-facing behavior on `1.x` minors (provider-emitted status events,
  after-hook error defaults, `DISABLED` semantics). Mitigation: catalog
  `~` pins, client-API-only consumption, this watchlist in AD-87.
- **Singleton/peer governance** — duplicate SDK copies break provider
  registration; peers + the manifest allowlist enforce one copy.
- **Provider maturity** — flagd's JS providers carry a still-experimental
  badge; OFREP JS is 0.x with SSE unimplemented. Mitigation: we ship no
  provider; the guide labels maturity honestly.
- **Context forking (D-5)** — request-derived targeting must not become a
  second context system: the resolver feeds `FlagEvaluationContext`; the
  SDK transaction-propagator stays optional documentation.

## 7. Open questions

- Does the bridge expose an owned-client convenience (`new
  OpenFeatureFlagEvaluator({ client })` + `closeClient: true`), or stays
  global-client-only with app-owned lifecycle? Decide in P1-2 (lean:
  both, owned-client documented for tests).
- Should `PropertyFlagProvider` emit `flagMetadata: {}` for detail-shape
  parity, or leave the field absent? Decide in P1-1 (lean: absent stays
  valid; bridge always sets it).
- Does `apps/04-ndigo-api` gain a bridge demo? It would need a provider
  process; lean: no — the guide recipe + a test suffice until a vendor
  demo lands with Phase 2's recipes.
