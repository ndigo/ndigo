# Guide 28 — Feature Flags

Feature flags are runtime, refreshable switches — the `@FeatureGate` layer
of the framework (AD-82). They are **not** `@whenProperty`:
`@whenProperty` (with `@whenProfile`) decides at **boot** whether a
configuration class _registers_; `@whenFeature` decides at **request time**
whether a route _is reachable_ — and can flip while the process runs.

## The model: evaluate, never crash

All flag evaluation runs through one contract, `FlagEvaluator`
(`@blue/flags`): a typed `evaluate(flag, defaultValue, ctx?)` that
**never throws** — a missing flag, a wrong-typed value, or a broken
backend returns the supplied default with a `reason` and (on error) an
`errorCode`. Flags cannot crash requests; a provider outage degrades to
defaults you chose.

## Zero-config start: flags from config

The default `FLAG_EVALUATOR` bean (registered by `NodeAutoConfiguration`)
is a `PropertyFlagProvider` reading the environment's **resolved
properties** live — no cache, so an `environment.refresh()` makes changes
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
import { whenFeature } from '@blue/flags';

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
document (`urn:blue:not-found`) — the kill switch reads. Un-gated routes
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
import { FLAG_EVALUATOR } from '@blue/flags';

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
client IP (the AD-37/rate-limiter address, so `X-Forwarded-For` respects
the trusted-proxy allowlist) — and the local provider buckets the key
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
the local algorithm is intentionally independent (AD-82 D-3).

## Vendors: OpenFeature is the seam

`@blue/flags` ships no vendor SDK; vendors arrive as **OpenFeature
providers** behind the same `FlagEvaluator` contract. The bridge
(`@blue/flags-openfeature`) evaluates through an OpenFeature client, so app
code never imports a vendor and swapping vendors is a bootstrap + bean
change:

```bash
pnpm add @blue/flags-openfeature @openfeature/flagd-provider
```

```ts
// Bootstrap — register the provider once, before the context is built.
import { OpenFeature } from '@openfeature/server-sdk';
import { FlagdProvider } from '@openfeature/flagd-provider';

await OpenFeature.setProviderAndWait(new FlagdProvider());
```

```ts
// App configuration — override the zero-config property provider.
import { FLAG_EVALUATOR } from '@blue/flags';
import { OpenFeatureFlagEvaluator } from '@blue/flags-openfeature';

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
  seeds the client IP today; pass `{ targetingKey, attributes }` for
  programmatic checks (principal/tenant attribution is a resolver seam on
  the way).
- **Domains and clients**: `new OpenFeatureFlagEvaluator({ domain:
  'checkout' })` reads that domain's provider; `{ client }` takes an
  explicitly built client.
- **Browser/edge**: this bridge is the server SDK; the web SDK's
  sync-snapshot model is a separate follow-up.
- **Tests**: the OpenFeature SDK's in-memory provider is the zero-infra
  stub — no vendor service needed.

## What this is not

- **Not** a registration gate — `@whenProperty` / `@whenProfile`
  (`@blue/core`) still decide what boots.
- **Not** automatic for service methods — non-route gating is an explicit
  `evaluate()` check (or an AD-42 interceptor when one is needed).
- **Not** a caching layer — the local provider is read-through by design;
  caching is a provider concern (a follow-up behind the SPI).

Reference application: `apps/04-blue-api` — the `/gated-report` demo route,
grounded in `test/feature-flags.spec.ts`.
