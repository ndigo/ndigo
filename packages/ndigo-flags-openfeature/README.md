# @ndigo/flags-openfeature

> OpenFeature bridge for Ndigo flags — the `FlagEvaluator` over `@openfeature/server-sdk`, the web SDK (`./web`), and evaluation telemetry.

Bridges OpenFeature clients into the `@ndigo/flags` SPI, so vendor flag
providers (flagd, OFREP, LaunchDarkly, Unleash, …) arrive behind the
framework contract: app code, `@whenFeature` gates, and DI wiring never
change — only the `FLAG_EVALUATOR` entry does. The `./web` entry does the
same for browser apps (`@openfeature/web-sdk`), and
`FeatureFlagTelemetryHook` records an evaluation span per call.

## Installation

```bash
pnpm add @ndigo/flags-openfeature @openfeature/server-sdk
# browser apps instead pair the web entry with the web SDK:
pnpm add @ndigo/flags-openfeature @openfeature/web-sdk
```

Prerequisites: Node.js ≥24 (the framework floor), and a provider package
for your flag backend (e.g. `@openfeature/flagd-provider`,
`@openfeature/ofrep-provider`, `@launchdarkly/openfeature-node-server` —
the web SDK has its own provider set, e.g. `@openfeature/flagd-web-provider`).

## Getting Started

Register a provider once at bootstrap, then point the framework's flag
entry at the bridge:

```ts
// bootstrap: the provider, before the application context is built
import { OpenFeature, InMemoryProvider } from '@openfeature/server-sdk';

await OpenFeature.setProviderAndWait(
    new InMemoryProvider({
        'todo.dueDates': { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false },
    })
);
```

```ts
// app configuration: override the zero-config property provider
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

`@whenFeature('todo.dueDates')` routes, programmatic `evaluate()` checks,
and percentage rollouts all keep working — the interceptor evaluates
through the same entry.

## Usage

- **Global client (default)** — `new OpenFeatureFlagEvaluator()` reads
  the default provider registered on the OpenFeature singleton.
- **Domain-scoped client** — `new OpenFeatureFlagEvaluator({ domain:
  'checkout' })` reads that domain's provider.
- **Explicit client** — `new OpenFeatureFlagEvaluator({ client })` uses a
  client you built (client-scoped hooks or context); mixing `client` and
  `domain` is rejected.

The evaluation carries the provider's reason, variant, error
classification, and `flagMetadata`; providers that resolve `null` narrow
to your default with `TYPE_MISMATCH` (the SPI default selects the type).
Evaluation never throws: a violating hook or provider degrades to your
default with `reason: 'ERROR'`.

**Lifecycle belongs to the application**: the OpenFeature singleton and
its providers are set (`setProvider` / `setProviderAndWait`) and closed
(`OpenFeature.close()`) by the app — this evaluator holds no resources and
defines no `close()`.

## Browser apps (the `./web` entry)

The `/web` entry maps the same SPI onto `@openfeature/web-sdk` for UI
gating in SPAs:

```ts
import { OpenFeature, InMemoryProvider } from '@openfeature/web-sdk';
import { WebOpenFeatureFlagEvaluator } from '@ndigo/flags-openfeature/web';

await OpenFeature.setProviderAndWait(
    new InMemoryProvider({
        betaUI: { variants: { on: true, off: false }, defaultVariant: 'off', disabled: false },
    })
);
await OpenFeature.setContext({ targetingKey: userId, plan }); // static context

const evaluator = new WebOpenFeatureFlagEvaluator();
const { value } = await evaluator.evaluate('betaUI', false);
```

The web SDK resolves from a provider-materialized snapshot with
**synchronous** evaluation: `setProviderAndWait` settles readiness at
bootstrap, and the SPI's per-call context argument is **not forwarded** —
targeting is the static context (`OpenFeature.setContext(...)`), which
providers re-concile via `onContextChange`. Domain-scoped clients
(`{ domain }`) and explicit clients (`{ client }`) work exactly as on the
server entry.

## Evaluation telemetry

`FeatureFlagTelemetryHook` emits one `feature_flag.evaluation` span per
evaluation with the OpenTelemetry feature-flag semconv attributes —
`feature_flag.key`, `feature_flag.provider.name`,
`feature_flag.result.reason`, `feature_flag.result.variant`, plus
`error.type` on abnormal outcomes. Register it per client or globally:

```ts
import { OpenFeature } from '@openfeature/server-sdk';
import { FeatureFlagTelemetryHook } from '@ndigo/flags-openfeature';

OpenFeature.getClient().addHooks(new FeatureFlagTelemetryHook());
```

The same instance satisfies the web SDK's hook contract
(`OpenFeature.addHooks(...)` in the browser), and the hook is inert until
your telemetry providers are wired (`@ndigo/telemetry-node` /
`@ndigo/telemetry-web`).

## API

The full API is at [`api/`](api/README.md).

## Development

```bash
pnpm --filter @ndigo/flags-openfeature test
```

## See Also

- [Guide 34 — Feature Flags](../../docs/guides/34-feature-flags.md) — the
  vendor recipe in context
- [@ndigo/flags](../ndigo-flags/README.md) — the SPI this bridge implements
- [openfeature.dev](https://openfeature.dev) — the standard and its
  provider ecosystem

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
