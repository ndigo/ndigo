# Blue Context

> Application context for BlueJS: dependency container, configuration decorators, property sources, environment, and resource/event infrastructure.

The BlueJS application context: dependency container, configuration
decorators, property sources, environment, and resource/event infrastructure.

## Installation

```bash
pnpm add @blue/context
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { MetadataConfigApplicationContext, configuration, entry } from '@blue/context';

@configuration
class AppConfig {
    @entry() greetingService() {
        return new GreetingService();
    }
}

const context = new MetadataConfigApplicationContext('app');
context.register(AppConfig);
context.refresh();

const service = context.getValue<GreetingService>('greetingService');
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **Application context** — `ApplicationContext`, `MetadataConfigApplicationContext`
- **Configuration decorators** — `@configuration`, `@entry()`, `@profile`, `@environment`, `@configurationProperties`
- **Property sources** — named, ordered sources with placeholder resolution and `@Value`-style typed lookup
- **Environment + profiles** — profile activation and typed config binding
- **Resource & events** — `ResourceLoader`/`Resource` abstractions, event emitters

## Development

```bash
pnpm --filter @blue/context build:lib
pnpm --filter @blue/context test
```

## See Also

- [@blue/factory](../blue-factory/README.md) — factory scope and lifecycle
- [@blue/boot](../blue-boot/README.md) — `ApplicationBuilder` on top of the context
- [@blue/test](../blue-test/README.md) — boots real contexts in tests

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
