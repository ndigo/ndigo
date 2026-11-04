# @ndigo/flags

> Feature flags for Ndigo — the `FlagEvaluator` SPI and the `@whenFeature` gate.

Feature flags are runtime, refreshable switches. The contract lives here —
the **SPI** (typed, async, never-throw evaluation), the **local provider**
(flags as `feature.*` config properties, read live), and the **gate
metadata** (`@whenFeature`, enforced by `FeatureGateInterceptor` in
`@ndigo/platform-node`). Backends are optional and owned by the packages
that own their clients; `@ndigo/flags-openfeature` bridges vendor flagging
(flagd, OFREP, LaunchDarkly, …) through the same contract.

## Installation

```bash
pnpm add @ndigo/flags
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

Single node, zero config — `NodeAutoConfiguration` registers a
`PropertyFlagProvider` bean (reading `feature.*` from the environment) and
the gate interceptor on the default mapping. Declare a gate:

```ts
import { whenFeature } from '@ndigo/flags';

class TodoController {
    @whenFeature('todo.dueDates')
    @routeMapping('/todo/due')
    async dueDates() { … }
}
```

With `config/application.json`:

```json
{ "feature": { "todo.dueDates": true } }
```

The route is reachable while the flag is truthy; when it is `false`
(plain explicit off) the route returns **404** (`urn:ndigo:not-found`) —
the `DisabledFeaturesHandler` default. Because the provider is
**read-through**, `environment.refresh()` (AD-29) flips flags live:
no cache, no restart.

Programmatic checks (service methods, view logic):

```ts
import { FLAG_EVALUATOR } from '@ndigo/flags';

const evaluation = await evaluator.evaluate('todo.dueDates', false);
if (evaluation.value) { … }
```

## The SPI

```ts
interface FlagEvaluator {
    readonly kind: string;
    evaluate<T extends FlagValue>(
        flag: string,
        defaultValue: T,
        ctx?: { targetingKey?: string; attributes?: Record<string, unknown> }
    ): Promise<FlagEvaluation<T>>;
    close?(): Promise<void>;
}
```

- **Typed**: the type of `defaultValue` selects the evaluation type
  (boolean, number, string, or object).
- **Never-throw**: abnormal execution returns the default with
  `reason: 'ERROR'` and an `errorCode` (`FLAG_NOT_FOUND`,
  `PARSE_ERROR`, `TYPE_MISMATCH`, `GENERAL`, …) — flags cannot crash
  requests.
- **Provider-pluggable**: the bean is the seam.
  `@ndigo/flags-openfeature` bridges vendor providers (flagd, OFREP,
  LaunchDarkly, …) through the same contract; app code never imports a
  vendor SDK.

## The local provider

`PropertyFlagProvider` maps flag `name` → property `<namespace>.<name>`
(default namespace `feature`). Boolean semantics mirror the
`@whenProperty` truthiness rule: present + truthy (or the literal
`'true'`) is on; `'false'`, `0`, `''`, `null` are off; a missing property
is `DEFAULT` (the caller's default value).

**Percentage rollouts**: declare `feature.rollout.<flag>` ∈ [0, 1] and
pass a targeting key to `evaluate` — the provider buckets the key
(stable FNV-1a) and gates the flag (`SPLIT` reason). The route gate seeds
the key from the client IP automatically; untargeted evaluations are
closed unless the rollout is `1`.

## Not in this package

- Route enforcement lives in `@ndigo/platform-node`
  (`FeatureGateInterceptor`).
- Registration-time conditions stay in `@ndigo/core` (`@whenProperty`,
  `@whenProfile`) — those gate _what registers at boot_; `@whenFeature`
  gates _what is reachable per request_.
- Attribute-based targeting (groups, roles, cohorts): the
  `FlagEvaluationContext.attributes` seam exists; the local provider
  buckets on `targetingKey` only — richer rules belong to a targeting or
  vendor provider behind the SPI.

ISC — see the repository license.

## Usage

Declare gates on routes (`@whenFeature`, enforced by the platform's
`FeatureGateInterceptor`), check flags programmatically via the
`FLAG_EVALUATOR` bean, or implement a custom provider behind the
`FlagEvaluator` SPI. See [guide 28](../../docs/guides/28-feature-flags.md)
for the full walk-through (config shapes, refresh semantics, the 404
denial, vendor bridging).

## API

The public surface mirrors the SPI: `FlagEvaluator` / `FlagEvaluation`
types, `FlagEvaluationContext`, `likeFlagEvaluator`,
`validateFlagKey`, `PropertyFlagProvider`, `whenFeature` /
`getWhenFeature` / `WHEN_FEATURE_KEY`, and `FLAG_EVALUATOR`. Generated
reference: `api/`.

## Development

```bash
pnpm --filter @ndigo/flags build:lib   # tsc -b tsconfig.build.json
pnpm --filter @ndigo/flags test        # vitest run
```

The leaf depends only on `@ndigo/factory` (for the `ContextToken`) — keep
it that way: platform-specific enforcement lives in
`@ndigo/platform-node`.

## Contributing

Follow the repository conventions ([guide 12](../../docs/guides/12-package-documentation.md)):
JSDoc blocks with `@module`/`@since`/`@author`, `Symbol.metadata`
decoration-time validation, tested via vitest with fail-before/pass-after
evidence per change.

## License

ISC — see the repository license.
