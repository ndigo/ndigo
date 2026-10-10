# AD-82: Feature flags — `@blue/flags` (FlagEvaluator SPI + `@whenFeature` gate)

**Date:** 2026-10-10
**Status:** Accepted
**Deciders:** Framework owner (GAP-11 of
`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6; Web-awesome-era
industry research 2026-10-10)

---

## Context

GAP-11: **feature flags (OpenFeature)** — absent, 1.0-severity low;
recommended shape "`FlagEvaluator` SPI over property sources". The 2026-10-07
plan defers it ADR-gated ("each needs an ADR + owner sign-off"); this record
is the gate.

What the repository already provides, and what is missing:

- **Registration-time conditions exist.** `@whenProperty` /
  `@whenProfile` / `@whenBrowser` / `@whenMissingEntry`
  (`packages/blue-core/src/conditional.ts`) gate whether a configuration
  class registers, evaluated once at boot by `isActive(target, ctx)`;
  `@whenProfile` carries the expression grammar. This is the
  `@ConditionalOnProperty` layer — static, boot-time, no runtime
  re-evaluation.
- **No runtime flag abstraction.** The 2026-10-07 appendix-B refresh notes
  "No feature-flag abstraction. Peer: OpenFeature spec" and the TOL row
  says "defer: FlagEvaluator SPI with an OpenFeature-compatible provider,
  local provider backed by the existing property sources/refresh". `feature`
  config keys today are just app properties bound by user classes.
- **The `@scheduled` decorator pattern is the template for a gate.**
  Decoration-time validation → `Symbol.metadata` key (`schedule:<method>`)
  → registry discovery → enforcement (`packages/blue-scheduler/src/scheduled.ts`).
  `@rateLimit` follows the same shape with default-on interceptor
  enforcement in `@blue/platform-node` (`rate-limit-interceptor.ts`).
- **Per-request enforcement has a verified seam.** `RadixMetadataHandlerMapping`
  runs a `RouteHandlerInterceptor` chain (`mapping.interceptors`), and
  `RateLimitInterceptor` is the reference: async `preHandle`, metadata gate,
  `denialOf(status, ...)` + problem-document write, registered by
  `NodeAutoConfiguration.handlerMapping()`.
- **Beans reach the environment.** `AsApplicationContextAware(Null)` +
  `this.applicationContext?.environment` is the established pattern
  (`ManagementAutoConfiguration`, the `/env` and `/health` controllers in
  `@blue/management`); the `CONFIG_REFRESH_EVENT` (`environment.ts:25`)
  already notifies refresh-scope rebinding on config changes (AD-29).

## Industry evidence (2026-10 research)

- **OpenFeature** (CNCF) is the standard: a spec (v0.9.0, stabilized
  evaluation/providers; hooks/events/context hardened) defining typed flag
  evaluation (`getBooleanValue`/`getNumberValue`/`getStringValue`/`getObjectValue`),
  a **provider** adapter interface, evaluation context (targeting key +
  attributes), never-throw semantics (default value on abnormal execution
  with `reason`/`errorCode`), provider lifecycle events, hooks, and a
  tracking API. The spec deliberately does **not** define a backend — the
  provider is the portability seam. Ecosystem: Datadog, Vercel Flags,
  Cloudflare Flagship, Google App Lifecycle Manager, Mixpanel, Octopus
  Deploy all shipped products built on OpenFeature in 2026; Split ships an
  official OpenFeature provider (as do LaunchDarkly, Flagsmith, Unleash,
  PostHog, flagd). Sources: openfeature.dev spec sections, the 2026-08
  OpenFeature update, split-openfeature-provider-js.
- **Spring** has no first-party flag framework. Enterprises compose:
  `@ConditionalOnProperty` (registration-time, static — the analog of our
  `@whenProperty`), Spring Cloud Config + `@RefreshScope` for runtime
  refresh, and **`@FeatureGate`** (Azure's
  `spring-cloud-azure-feature-management-web`, the closest "official"
  surface): an annotation on controller actions evaluated per-request with a
  **fallback handler** (default 404 via `DisabledFeaturesHandler`). Togglz
  fills the self-hosted niche (FeatureManager + activation strategies +
  actuator `/togglz`), vendor SDKs the SaaS niche. The Spring enterprise
  pattern is: **annotation for the declaration, a manager bean for programmatic
  checks, a provider/state-repo for change, a management surface for ops** —
  vendors swappable by design.
- **Split.io** is a popular commercial system (treatments, percentage
  rollouts, attributes, kill switches). Its SDK is capable but vendor-locked;
  its OpenFeature provider makes it a drop-in behind the SPI. We adhere to
  OpenFeature, not a vendor — the SPI is the OpenFeature contract, and
  Split/LaunchDarkly/flagd become optional providers.

## Decision

### D-1 — One contract package: `@blue/flags` (new, layer 2, isomorphic)

`@blue/flags` owns the flag **contract** — the `FlagEvaluator` SPI, the
flag-value/reason/error typing, the graph metadata decorator, and the local
reference provider. It is a leaf package (depends only on `@blue/factory`
for the `ContextToken`, mirroring `@blue/rate-limit`), so the tooling and
browser tiers can consume the contract without pulling a platform. Backends
are adapters owned by the packages that own their clients (future
`@blue/redis/flags`; vendor providers are third-party OpenFeature providers).

### D-2 — `FlagEvaluator` SPI: typed, async, never-throw

```ts
type FlagValue = boolean | number | string | Record<string, unknown> | unknown[];

interface FlagEvaluation<T extends FlagValue> {
    value: T;
    /** 'STATIC' | 'TARGETING_MATCH' | 'SPLIT' | 'DISABLED' | 'DEFAULT' | 'ERROR' */
    reason: FlagEvaluationReason;
    variant?: string;
    errorCode?: FlagErrorCode; // 'FLAG_NOT_FOUND' | 'PARSE_ERROR' | 'TYPE_MISMATCH' | 'GENERAL' | ...
}

interface FlagEvaluationContext {
    /** Stable identifier for the subject of the evaluation (user, session, tenant). */
    targetingKey?: string;
    /** Arbitrary attributes the provider may use for targeting. */
    attributes?: Record<string, unknown>;
}

interface FlagEvaluator {
    readonly kind: string;
    evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        ctx?: FlagEvaluationContext
    ): Promise<FlagEvaluation<T>>;
    close?(): Promise<void>;
}
```

- **Typed evaluation**: boolean/number/string/object per call — the type
  is a parameter, not a method family (JavaScript idiom; the method-family
  surface (`getBooleanValue` etc.) adds nothing concrete here and we keep
  one verb, mirroring `convert(value, schema)` in AD-38).
- **Never-throw evaluation**: the client contract from OpenFeature §1.4.10 —
  abnormal execution (provider error, type mismatch, missing flag) returns
  the **default value** with `reason: 'ERROR'` + `errorCode`. Flag
  evaluation must never crash a request. (Configuration-time errors — bad
  flag key at decoration time, provider construction — still fail loud.)
- **Async by default (AD-39)**: the local provider resolves immediately, a
  remote provider resolves over its network hop. The same contract serves
  both.
- **`kind`** identifies the backend for log/troubleshooting, matching the
  `RateLimiter.kind` / `LockDriver.kind` convention.
- **`FLAG_EVALUATOR` ContextToken** (`@blue/factory`) for bean wiring.

### D-3 — `PropertyFlagProvider`: the zero-config local provider

`PropertyFlagProvider` reads flag state from the environment property
sources: flag `name` → property `feature.<name>` (default namespace
`feature`, configurable via constructor option). Semantics:

- Missing property → `DEFAULT` with the caller's default value.
- Boolean: present + truthy / `'true'` → `STATIC` true; `'false'`, `0`,
  `''`, `null` → `DISABLED` false.
- Numbers/strings: passed through when the type matches; a mismatched
  value → `TYPE_MISMATCH` + default (never throws).
- Objects: JSON objects and JSON-parsable strings → the object; unparsable
  → `PARSE_ERROR` + default.
- **Refresh**: the provider is read-through — every evaluation reads the
  current property state, so `environment.refresh()` (AD-29) makes flag
  changes visible immediately with no cache to invalidate. Caching behind
  the SPI is a provider concern, not a contract (follow-up if a consumer
  needs it).

This closes the "local provider backed by the existing property
sources/refresh" recommendation with zero new runtime machinery; the
`CONFIG_REFRESH_EVENT` observer is unnecessary because there is no cache.

**Amended 2026-10-10 (post-review consumer ask): percentage rollouts
landed in the local provider.** A boolean flag may declare
`feature.rollout.<flag>` ∈ [0, 1]; evaluation then buckets the
evaluation-context targeting key (`SPLIT` reason) via a local
stable FNV-1a hash — deterministic per key across processes, closed for
untargeted requests unless `1`. The platform gate seeds the targeting
key from the client IP (AD-37 resolution; the rate-limiter key).
Bucket/reason semantics and the "invalid rollout ignored" rule are
documented in guide 28; the algorithm is intentionally independent from
any future vendor bridge (D-6), whose own flag configuration and
bucketing take over per-flag at migration.

### D-4 — `@whenFeature` — the `@FeatureGate` analog (route-level gate)

```ts
// metadata-only decorator; enforcement is the FeatureGateInterceptor
@repository
class TodoService {
    @whenFeature('todo.dueDates')
    dueDates() { … }
}
```

- Decoration-time validation: flag key must match `[A-Za-z0-9._:-]+`
  (the lock/job-name idiom, validated at definition, fail loud).
- Writes `Symbol.metadata` under `flags:whenFeature:<method>`
  (class-level under `flags:whenFeature`) — passive metadata, exactly the
  `@scheduled` / `@rateLimit` pattern.
- **Enforcement is the `FeatureGateInterceptor`** in `@blue/platform-node`
  (default-on in the node mapping, like `RateLimitInterceptor`): per
  request, when the handler method carries the metadata, evaluate the flag
  via the `FLAG_EVALUATOR` bean; when the flag is off → **404 problem
  document** (`ProblemTypes.notFound`, the repository's `DisabledFeaturesHandler`
  analog — Azure's default). Un-gated routes are untouched.
- `@blue/flags` stays isomorphic: the decorator/metadata/SPI carry no
  platform dependency; the interceptor (node-only) lives beside the other
  platform interceptors.

### D-5 — Wiring mirrors AD-79/AD-73

`NodeAutoConfiguration` (via `AsApplicationContextAware`) registers the
`FLAG_EVALUATOR` bean — default `PropertyFlagProvider` backed by
`this.applicationContext.environment` — and pushes `FeatureGateInterceptor`
into the mapping chain (after security headers, before rate limiting).
Precedence: feature gate first (a disabled feature is not rate-limited;
cheap, deterministic).

### D-6 — OpenFeature compatibility is a provider-seam, not a runtime

We implement the SPI semantics (typed values, never-throw, reason/error
codes, targeting context); we do not depend on `@openfeature/server-sdk`.
A **bridge provider** that adapts an OpenFeature provider into our SPI is a
follow-up (documented in the package README); the industry ecosystem
(Split, LaunchDarkly, flagd, …) becomes reachable through it. This keeps
the 1.0 dependency surface minimal while keeping the portability decision
unmade (the SPI is the seam).

## Alternatives considered

- **`@whenFeature` as a wrapper over `@whenProperty`** — rejected: the
  semantics diverge at the first per-request evaluation. `@whenProperty` is
  class-level registration (boot-time, static); `@whenFeature` is
  method-level evaluation (runtime, refreshable, provider-backed, with
  fallback semantics). A shared "check a condition" primitive buys nothing
  and couples two different layers (see ADR context).
- **`@whenExpression` (SpEL-style)** — rejected: `@whenProfile(expr)`
  already carries the repo's expression grammar (AD-14); an arbitrary
  expression evaluator adds an attack/typo surface with no consumer
  (matches the TS-native layer's SpEL rejection, AD-34).
- **Depend directly on `@openfeature/server-sdk`** — rejected for 1.0:
  pulls the full SDK into the leaf tier, and the SDK's own spec
  conformance is still rolling (v0.9.0 compliance tracking across SDKs).
  The SPI keeps us SDK-free; the bridge provider is additive later.
- **Method-scope gate for service beans** — deferred: automatic weaving of
  non-route methods is AD-42's `@blue/proxy` interception territory, and no
  1.0 consumer needs it. Route-level gates + programmatic
  `evaluator.evaluate()` cover the documented patterns; service-method
  gating composes as an explicit check or an interceptor when a consumer
  asks.
- **Split SDK as the reference provider** — rejected as a dependency;
  Split remains reachable through its OpenFeature provider (the ecosystem
  decision in D-6).

## Consequences

- Runtime, refreshable feature gating for Node routes with zero wiring —
  the property-backed default follows the "memory/local is the default,
  external is opt-in" doctrine (AD-40).
- The `feature.*` config namespace becomes a framework-read namespace:
  the boot schema (`application.schema.json`) gains a `feature` section
  (editor completion + validation for the local provider's keys).
- A vendor-agnostic seam: Split/LaunchDarkly/flagd/PostHog all reachable
  through OpenFeature providers behind the SPI.
- Never-throw evaluation means flags cannot crash requests; a broken
  provider degrades to defaults with `ERROR` reasons visible in telemetry.
- Cost: a new leaf package + one interceptor + schema/docs surface. No
  change to `@whenProperty` or existing conditional config.

## References

- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-11 row.
- OpenFeature spec §1.3-1.4 (flag evaluation, details, never-throw),
  §2 (providers), §3 (evaluation context); openfeature.dev ecosystem.
- `packages/blue-core/src/conditional.ts` (`@whenProperty` family).
- `packages/blue-platform-node/src/rate-limit-interceptor.ts`
  (interceptor pattern + `denialOf` + problem documents).
- `packages/blue-scheduler/src/scheduled.ts` (metadata decorator pattern).
- `packages/blue-management/src/management-auto-configuration.ts`
  (`AsApplicationContextAware` pattern).
- `packages/blue-rate-limit` (leaf SPI package layout, AD-79).
- AD-29 (config refresh), AD-39 (async by default), AD-42 (method
  interception — deferred scope note), AD-40 (memory-first doctrine).
