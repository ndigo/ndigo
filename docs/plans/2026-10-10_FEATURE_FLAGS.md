# 2026-10-10 Feature flags — `@ndigo/flags` (FlagEvaluator SPI + `@whenFeature` route gate)

**Date:** 2026-10-10
**Status:** Executed (see §7)
**Decision:** [AD-82](../decisions/2026-10-10_AD82_FEATURE_FLAGS.md)
**Scope:** GAP-11 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): feature flags —
the `FlagEvaluator` SPI as a leaf package, the property-backed local
provider, and the `@whenFeature` route gate (the `@FeatureGate` analog).

---

## 1. Problem

Apps have no runtime, refreshable feature gating. `@whenProperty` is
class-level **registration** (static, boot-time — the `@ConditionalOnProperty`
analog); there is no method-level, per-request, provider-backed gate (the
`@FeatureGate` layer). Enterprise feature-flag needs (kill switches,
percentage rollouts, vendor portability) need a runtime abstraction; the
2026-10-07 sweep deferred it as "FlagEvaluator SPI over property sources".

## 2. Current state (verified 2026-10-10)

| Seam                       | What exists                                                                                                                                        | What is missing                                          |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| Registration conditions    | `@whenProperty`/`@whenProfile`/`@whenBrowser`/`@whenMissingEntry` (`ndigo-core/src/conditional.ts`) — boot-time class gates                        | runtime, per-request evaluation                          |
| Metadata decorator pattern | `@scheduled` (`schedule:<method>`), `@rateLimit` (`rate:limit:<method>`) — decoration-time validation, `Symbol.metadata`                           | a flag gate decorator                                    |
| Per-request enforcement    | `RouteHandlerInterceptor` chain in `RadixMetadataHandlerMapping`; `RateLimitInterceptor` (async `preHandle`, `denialOf`, problem doc)              | a feature-gate interceptor                               |
| Entry wiring               | `@entry(TOKEN)` + `NodeAutoConfiguration` (AD-79/73); `AsApplicationContextAware` gives entries the environment (`ManagementAutoConfiguration`)    | a `FLAG_EVALUATOR` entry                                 |
| Config refresh             | `CONFIG_REFRESH_EVENT` (`environment.ts:25`) — AD-29 rebind                                                                                        | flag read-through (no cache — provider reads live state) |
| Schema                     | `application.schema.json` framework namespaces (`management` READ from config, `profiles`/`telemetry` annotated `x-ndigo-read-from-config: false`) | the `feature` namespace                                  |

## 3. Change

1. **`@ndigo/flags`** (new, layer 2, isomorphic, deps: `@ndigo/factory`):
    - `flag-evaluator.ts`: `FlagValue`, `FlagEvaluation<T>`,
      `FlagEvaluationReason`, `FlagErrorCode`, `FlagEvaluationContext`,
      `FlagEvaluator` SPI (async `evaluate`, never-throw), `likeFlagEvaluator`
      guard.
    - `property-flag-provider.ts`: `PropertyFlagProvider` — constructor
      options `{ getProperty, namespace = 'feature' }`; read-through
      semantics per AD-82 D-3 (missing → DEFAULT, truthy/'true' → STATIC,
      'false'/0/''/null → DISABLED, type mismatch → TYPE_MISMATCH+default,
      object JSON coerce → PARSE_ERROR+default).
    - `when-feature.ts`: `whenFeature(flag)` class/method decorator
      (key grammar `[A-Za-z0-9._:-]+`, decoration-time validation) +
      `WHEN_FEATURE_KEY` + `getWhenFeature(target, method?)` reader.
    - `context-tokens.ts`: `FLAG_EVALUATOR` token.
    - `index.ts` barrel.
2. **`@ndigo/platform-node`**:
    - `feature-gate-interceptor.ts`: `FeatureGateInterceptor(evaluator)` —
      method metadata gate (method over class, mirror of `RateLimitInterceptor`),
      off → **404 problem document** (`ProblemTypes.notFound`) + `denialOf(404)`.
    - `node-auto-configuration.ts`: `@entry(FLAG_EVALUATOR) flagEvaluator()`
      → `PropertyFlagProvider` over `this.applicationContext.environment`
      (`AsApplicationContextAware` mixin, `ManagementAutoConfiguration`
      precedent); `handlerMapping()` pushes `FeatureGateInterceptor`
      (after security headers, before rate limit).
3. **Schema** (`packages/ndigo-boot/schema/application.schema.json`):
   `feature` namespace — READ from config (no `x-ndigo-read-from-config:
   false`), `additionalProperties: { $ref: configValue }`, description
   documents the flag semantics + `@whenFeature` + provider.
4. **Wiring/docs**: vitest alias (`@ndigo/flags`) + spec-tsconfig paths +
   package manifest; ARCHITECTURE package map (new row, platform-node hub
   count 17 → 18); guide 28 (new — feature flags) + guides index +
   docs README guide range (02–27 → 02–28); decisions index (AD-82);
   CHANGELOG; `pnpm doc` regenerated; `graft build`.

## 4. Deliberately out of scope

- **OpenFeature SDK bridge provider** — the SPI is the seam; a concrete
  adapter over `@openfeature/server-sdk` providers (Split/LaunchDarkly/
  flagd) is additive later (AD-82 D-6).
- **Service-method auto-weaving** — AD-42 proxy interception territory;
  route gates + programmatic `evaluator.evaluate()` cover 1.0 patterns
  (AD-82 alternatives).
- **Caching + CONFIG_REFRESH_EVENT invalidation** — the read-through
  provider makes config refresh visible immediately; a caching provider is
  a provider concern.
- **Percentage rollouts / targeting in the local provider** — the
  evaluation-context seam exists (`FlagEvaluationContext`) and vendor
  providers implement targeting; the property-backed provider stays
  static (a `feature.<name>.<for>` targeting-key namespace is a follow-up
  if a consumer asks).

## 5. Failure posture

- **Never-throw evaluation** (OpenFeature §1.4.10): any provider failure
  returns the caller's default value with `reason: 'ERROR'` +
  `errorCode` — a broken flag backend degrades, never crashes requests.
- **Gate is fail-closed by posture**: an off/errored flag denies the route
  (404) — the conservative reading for a kill switch; an app that wants
  fail-open defaulting writes its own provider or passes defaults.

## 6. Verification

- `@ndigo/flags` specs: flag-key validation (accept/reject); evaluator
  contract (typed boolean/number/string/object, DEFAULT on missing,
  DISABLED on false, TYPE_MISMATCH/PARSE_ERROR + default, never-throw on
  throwing reader); `PropertyFlagProvider` namespace/pass-through/
  truthiness matrix; `likeFlagEvaluator` guard.
- `@ndigo/platform-node` specs: `whenFeature` decoration-time validation
  (bad key, non-method kind); interceptor metadata read (method over
  class); off flag → 404 problem doc + denial; on flag → passthrough;
  un-gated route untouched; with a real `PropertyFlagProvider` over a
  config-backed environment, `refresh()` flips the gate.
- Demo (`apps/04-ndigo-api`): a `@whenFeature('feature.noteFlags')` route
  gated via `config/application.json` + live-toggle spec.
- Full gate set (§9 of the review plan): `pnpm build` / `pnpm test` /
  `pnpm lint` / `pnpm format:check` / `pnpm docs:links` /
  `pnpm audit --prod` / `pnpm manifest:check` / `pnpm agents:check` /
  `pnpm typecheck` (build + spec lanes) / `pnpm test:tooling` / `pnpm doc`
  freshness / `graft build`.

## 7. Execution log (2026-10-10)

All changes landed in one pass with the verification below green;
`pnpm install` wired the new workspace package and the lockfile (twice —
once for `@ndigo/flags`, once for the `@ndigo/platform-node` dependency
edge).

- **`@ndigo/flags`** (22 specs): flag-key grammar, `likeFlagEvaluator`
  guard, the full provider matrix (boolean truthiness incl. the
  `'true'`/`'false'` strings, number coercion, string/object pass-through,
  PARSE_ERROR/TYPE_MISMATCH + default, throwing-reader → GENERAL +
  default, namespace validation), and `@whenFeature` metadata
  (decoration-time validation, method/class keys, instance reads).
- **`@ndigo/platform-node`** (8 specs in `feature-gate.spec.ts`): gate
  interceptor unit contract (404 `urn:ndigo:not-found` problem doc, method
  over class, un-gated pass-through, missing-flag fail-closed) _and_ the
  real wiring: `FLAG_EVALUATOR` entry + **live refresh flip** over
  `StandardEnvironment` (`addFirst` source + `environment.refresh()` →
  gated route 200, restored 404 control).
- **Substrate learning (documented in AD-82.D-5):** parser-created
  configuration values get container processing (aware injection) only as
  registered entry values — `handlerMapping()`'s nested evaluator needed the
  same instance the entry registers, so `NodeAutoConfiguration` memoizes
  one `EnvironmentFlagEvaluator` serving both the entry and the interceptor
  (injection mutates the shared instance in place).
- **Demo** (`apps/04-ndigo-api`): `FeatureFlagController` (`/gated-report`,
  `@whenFeature('gated.report')`), flat dotted `feature.gated.report` key
  in `config/application.json` (nested-literal dotted keys do not resolve
  through the property index — verified by probe), registered in
  `NodeAppConfiguration`; `test/feature-flags.spec.ts` (3 tests): on-flag
  200, un-gated control route, refresh-flip to 404 problem doc.
- **Schema/docs**: `feature` namespace in `application.schema.json`
  (READ from config), guide 28 + guides index + docs README range,
  AD-82 in the decisions index, plan entry + execution log, ARCHITECTURE
  package map (+`@ndigo/flags` row, platform-node hub 17 → 18), CHANGELOG.

**Addendum (same day, post-review ask): percentage rollouts.** The
evaluation-context seam became live: `feature.rollout.<flag>` ∈ [0, 1]
gates an enabled boolean flag per targeting key (`SPLIT` reason, stable
local FNV-1a bucket — `Math.imul`/`>>> 0` unsigned recipe; the
signed-int32 `^` trap caught by spec); `FeatureGateInterceptor` seeds the
context from the trusted-proxy client IP; untargeted requests are closed
unless rollout is 1; invalid rollout values are ignored (static).
Seven provider specs + three interceptor specs pin the semantics; AD-82
D-3 amended, guide 28 §"Staged rollouts". Service-method auto-weaving
and SPI caching remain deferred (recorded in AD-82) — no consumer and
the read-through contract is deliberate.
