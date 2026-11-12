# Ndigo Context

> Application context for Ndigo: dependency container, configuration decorators, property sources, environment, and resource/event infrastructure.

The Ndigo application context: dependency container, configuration
decorators, property sources, environment, and resource/event infrastructure.

## Installation

```bash
pnpm add @ndigo/context
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { MetadataConfigApplicationContext, configuration, entry } from '@ndigo/context';

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

## Usage

### Profile-gated entries

```ts
import { configuration, entry } from '@ndigo/context';
import { whenProfile } from '@ndigo/core';

@configuration
class AppConfiguration {
    @entry
    @whenProfile('dev | (test & !ci)') // expressions, not just exact names
    devTools() {
        return new DevToolsGate();
    }
}
```

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Application context** — `ApplicationContext`, `MetadataConfigApplicationContext`
- **Configuration decorators** — `@configuration`, `@entry()`, `@environment`, `@configurationProperties`; profile gates via `@whenProfile` (`@ndigo/core`)
- **Property sources** — named, ordered sources with placeholder resolution and `@Value`-style typed lookup
- **Environment + profiles** — profile activation and typed config binding
- **Resource & events** — `ResourceLoader`/`Resource` abstractions, event emitters

### Generic collection and tree consumers

`PropertySources` extends `Enumerable<string, PropertySource>`. Its `entries`,
`keys`, `values`, and `forEach` follow precedence order; replacing a source
preserves its position. These methods use native map iteration, while the
existing value-only iterator retains its snapshot behavior.

`ApplicationContext` extends the read-only core `ParentNode<ApplicationContext>`
and `ChildNode<ApplicationContext>` navigation contracts. Use `parent`,
`children`, and `root` for direct navigation. Cross-context events are explicit:
local `emit`, the shared `root` channel, `parent`/`children` addressing, or an
allowlisted `ContextEventGateway`.

## Development

```bash
pnpm --filter @ndigo/context build:lib
pnpm --filter @ndigo/context test
```

## See Also

- [Guide 49 — Configuration Layering & Context Composition](../../docs/guides/49-configuration-layering-and-context-composition.md)
  — profiles vs config layers vs context boundaries
- [@ndigo/factory](../ndigo-factory/README.md) — factory scope and lifecycle
- [@ndigo/boot](../ndigo-boot/README.md) — `ApplicationBuilder` on top of the context
- [@ndigo/test](../ndigo-test/README.md) — boots real contexts in tests

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
