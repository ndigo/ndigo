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

## Vendors: the provider is the seam

`@blue/flags` deliberately ships no vendor SDK (AD-82 D-6). Split,
LaunchDarkly, flagd, PostHog and friends all publish **OpenFeature
providers**; a bridge provider behind the same `FlagEvaluator` contract is
the documented path, so app code never imports a vendor and swapping
vendors is a bean change. The evaluation-context seam (`targetingKey`,
`attributes`) exists for percentage rollouts when a targeting provider is
wired.

## What this is not

- **Not** a registration gate — `@whenProperty` / `@whenProfile`
  (`@blue/core`) still decide what boots.
- **Not** automatic for service methods — non-route gating is an explicit
  `evaluate()` check (or an AD-42 interceptor when one is needed).
- **Not** a caching layer — the local provider is read-through by design;
  caching is a provider concern (a follow-up behind the SPI).

Reference application: `apps/04-blue-api` — the `/gated-report` demo route,
grounded in `test/feature-flags.spec.ts`.
