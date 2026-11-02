# @blue/flags-openfeature

> OpenFeature bridge for BlueJS flags — the `FlagEvaluator` over `@openfeature/server-sdk`.

Bridges an OpenFeature client into the `@blue/flags` SPI, so vendor flag
providers (flagd, OFREP, LaunchDarkly, Unleash, …) arrive behind the
framework contract: app code, `@whenFeature` gates, and DI wiring never
change — only the `FLAG_EVALUATOR` bean does.

## Installation

```bash
pnpm add @blue/flags-openfeature @openfeature/server-sdk
```

Prerequisites: Node.js ≥22 (the framework baseline), and a provider package
for your flag backend (e.g. `@openfeature/flagd-provider`,
`@openfeature/ofrep-provider`, `@launchdarkly/openfeature-node-server`).

## Getting Started

Register a provider once at bootstrap, then point the framework's flag
bean at the bridge:

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

`@whenFeature('todo.dueDates')` routes, programmatic `evaluate()` checks,
and percentage rollouts all keep working — the interceptor evaluates
through the same bean.

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

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md).

## Development

```bash
pnpm --filter @blue/flags-openfeature test
```

## See Also

- [Guide 28 — Feature Flags](../../docs/guides/28-feature-flags.md) — the
  vendor recipe in context
- [@blue/flags](../blue-flags/README.md) — the SPI this bridge implements
- [openfeature.dev](https://openfeature.dev) — the standard and its
  provider ecosystem

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
