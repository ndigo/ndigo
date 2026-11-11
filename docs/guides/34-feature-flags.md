# Guide 34 — Feature Flags

Feature flags are runtime, refreshable switches — the `@FeatureGate` layer
of the framework . They are **not** `@whenProperty`:
`@whenProperty` (with `@whenProfile`) decides at **boot** whether a
configuration class _registers_; `@whenFeature` decides at **request time**
whether a route _is reachable_ — and can flip while the process runs.

**Audience:** Node and browser application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) or [guide 02](02-building-a-browser-app.md) · **Reference app:** `apps/05-ndigo-api`

## What you'll learn

- Implement the never-throw `FlagEvaluator` SPI.
- Start from the property-backed provider.
- Gate a route with `@whenFeature`.
- Run a staged rollout.
- Bridge a vendor through OpenFeature.

## The model: evaluate, never crash

All flag evaluation runs through one contract, `FlagEvaluator`
(`@ndigo/flags`): a typed `evaluate(flag, defaultValue, ctx?)` that
**never throws** — a missing flag, a wrong-typed value, or a broken
backend returns the supplied default with a `reason` and (on error) an
`errorCode`. Flags cannot crash requests; a provider outage degrades to
defaults you chose.

## Zero-config start: flags from config

The default `FLAG_EVALUATOR` bean (registered by `NodeAutoConfiguration`)
is a `PropertyFlagProvider` reading the environment's **resolved
properties** live — no cache, so an `environment.refresh` makes changes
visible immediately. Flag `name` resolves `feature.<name>`; in
`config/application.json` (flat dotted keys for dotted names):

```json
{
    "feature": { "betaUI": true },
    "feature.gated.report": true
}
```

## Gating a route

```ts
import { whenFeature } from '@ndigo/flags';

@requestMapping('/')
class ReportController {
    @whenFeature('gated.report')
    @requestMapping('/gated-report')
    report() { … }
}
```

`FeatureGateInterceptor` (default-on in the node platform mapping, after
security headers, before rate limiting) evaluates the flag per request:
truthy → the handler runs; **off, absent, or error → 404** problem
document (`urn:ndigo:not-found`) — the kill switch reads. Un-gated routes
are untouched, and a disabled route never charges a rate-limit budget.
Method-level gates win over class-level gates.

Live flip (remote config server, dotenv reload, or a property-source
update) — with no restart:

```ts
const environment = context.environment;
environment.getPropertySources().addFirst('runtime', { 'feature.gated.report': false });
environment.refresh();
```

The read-through provider serves the new state on the next request.

## Programmatic checks

```ts
import { FLAG_EVALUATOR } from '@ndigo/flags';

const evaluation = await context.getValue(FLAG_EVALUATOR).evaluate('betaUI', false);
if (evaluation.value) { … }
```

Typed: the type of the default (`boolean | number | string | object`)
selects the evaluation type; number/string/object values pass through from
config with strict type checks (`TYPE_MISMATCH`/`PARSE_ERROR` + default on
mismatch).

## Staged rollouts

A boolean flag can carry a **percentage rollout**: declare the fraction at
`feature.rollout.<flag>` (a number in [0, 1]) — the flag's own value stays
the master switch:

```json
{
    "feature": { "betaUI": true },
    "feature.rollout.betaUI": 0.1
}
```

`@whenFeature` seeds each evaluation with a **targeting key** — the
session principal's id when a session/identity interceptor ran **before**
the gate (`NodeRequest.session.principal`, the principal's roles carried
as context attributes), otherwise the client IP (the /rate-limiter
address, so `X-Forwarded-For` respects the trusted-proxy allowlist) —
and the local provider buckets the key
deterministically (FNV-1a) into the rollout:

- keyed request with `bucket < rollout` → on (`reason: 'SPLIT'`);
- keyed request outside the fraction → off (404, like any closed gate);
- **untargeted requests** (no address) → off, unless rollout is `1` —
 experimental traffic is closed for anonymous callers;
- invalid rollout values (non-number, outside [0, 1]) are ignored — the
 flag behaves statically.

The same key always lands in the same bucket, across processes and
restarts. Rollouts compose with refresh: bump the fraction, refresh, and
the next request re-buckets. When a vendor provider later replaces the
local one, its own flag configuration (and its own bucketing) takes over —
the local algorithm is intentionally independent .

## Vendors: OpenFeature is the seam

`@ndigo/flags` ships no vendor SDK; vendors arrive as **OpenFeature
providers** behind the same `FlagEvaluator` contract. The bridge
(`@ndigo/flags-openfeature`) evaluates through an OpenFeature client, so app
code never imports a vendor and swapping vendors is a bootstrap + bean
change:

```bash
pnpm add @ndigo/flags-openfeature @openfeature/flagd-provider
```

```ts
// Bootstrap — register the provider once, before the context is built.
import { OpenFeature } from '@openfeature/server-sdk';
import { FlagdProvider } from '@openfeature/flagd-provider';

await OpenFeature.setProviderAndWait(new FlagdProvider());
```

```ts
// App configuration — override the zero-config property provider.
import { FLAG_EVALUATOR } from '@ndigo/flags';
import { OpenFeatureFlagEvaluator } from '@ndigo/flags-openfeature';

@configuration
class AppConfiguration {
    @entry(FLAG_EVALUATOR)
    flagEvaluator() {
        return new OpenFeatureFlagEvaluator();
    }
}
```

Everything above keeps working: `@whenFeature` gates, rollouts, and
programmatic checks evaluate through the same bean; the
reason/variant/error vocabulary is already OpenFeature's, and
`flagMetadata` (config version, bucket info, …) rides the evaluation.

- **Readiness**: `setProviderAndWait` resolves once the provider is ready;
 before that, evaluations return your defaults (never-throw holds).
- **Targeting**: providers target on the evaluation context — the gate
 seeds the session principal when a session/identity interceptor ran
 first, else the client IP; pass `{ targetingKey, attributes }` for
 programmatic checks. Apps register their own **`FLAG_CONTEXT_RESOLVER`**
 bean for tenant/attribute targeting from elsewhere in the request (the
 default resolver is `SessionPrincipalFlagContextResolver`; order your
 session interceptor before the gate to make principals visible).
- **Domains and clients**: `new OpenFeatureFlagEvaluator({ domain:
 'checkout' })` reads that domain's provider; `{ client }` takes an
 explicitly built client.
- **Telemetry**: register `FeatureFlagTelemetryHook` (this package) on a
 client or globally — one `feature_flag.evaluation` span per evaluation
 with the semconv attributes (key, provider, reason, variant,
 `error.type`); inert until `@ndigo/telemetry-node`/`-web` providers are
 wired, and the same instance works on the web SDK.
- **Provider choice**: flagd (`@openfeature/flagd-provider`) and OFREP
 (`@openfeature/ofrep-provider` — the vendor-neutral HTTP protocol)
 install the same way; both still carry maturity badges upstream, and JS
 push (SSE) is not implemented yet, so they poll.
- **Tests**: the OpenFeature SDK's in-memory provider is the zero-infra
 stub — no vendor service needed.

## Browser apps (the web SDK)

UI gating in SPAs uses the package's `/web` entry over
`@openfeature/web-sdk`:

```bash
pnpm add @ndigo/flags-openfeature @openfeature/web-sdk
```

```ts
import { OpenFeature, InMemoryProvider } from '@openfeature/web-sdk';
import { WebOpenFeatureFlagEvaluator } from '@ndigo/flags-openfeature/web';

await OpenFeature.setProviderAndWait(new InMemoryProvider({ … }));
await OpenFeature.setContext({ targetingKey: userId, plan }); // static context

const evaluator = new WebOpenFeatureFlagEvaluator();
const { value } = await evaluator.evaluate('betaUI', false);
```

The web SDK materializes flags per context and evaluates
**synchronously** — `setProviderAndWait` settles readiness at bootstrap,
and the per-call context argument is not forwarded: targeting is the
static context (`OpenFeature.setContext`), re-conciled by the provider
(`onContextChange`). Domains (`{ domain }`) and explicit clients
(`{ client }`) work as on the server entry, and `FeatureFlagTelemetryHook`
registers on the web client with the same instance.

## What this is not

- **Not** a registration gate — `@whenProperty` / `@whenProfile`
 (`@ndigo/core`) still decide what boots.
- **Not** automatic for service methods — non-route gating is an explicit
 `evaluate` check (or an interceptor when one is needed).
- **Not** a caching layer — the local provider is read-through by design;
 caching is a provider concern (a follow-up behind the SPI).

Reference application: `apps/05-ndigo-api` — the `/gated-report` demo route,
grounded in `test/feature-flags.spec.ts`.

## See also

- [Guide 01 — Building a Node API](01-building-a-node-api.md) — the app lifecycle
- [apps/05-ndigo-api](../../apps/05-ndigo-api/README.md) — the `/gated-report` demo
- — the flags decision
