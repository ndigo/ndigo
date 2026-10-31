# Blue Factory

> Inversion-of-control container and scope strategies for BlueJS — powers dependency injection in the application context.

`@blue/factory` provides the inversion-of-control (IoC) / dependency-injection foundation of BlueJS. Its `DefaultFactory` implementation backs the `GenericApplicationContext` container, and its interfaces (`FactoryAware`, `Initializable`, `Destroyable`) are integration points for other framework entities.

## Installation

```bash
pnpm add @blue/factory
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { DefaultFactory } from '@blue/factory';

class GreetingService {
    greet() {
        return 'hello';
    }
}

const factory = new DefaultFactory();
factory.setValue('greetingService', GreetingService);

factory.getValue<GreetingService>('greetingService').greet(); // 'hello'
```

## Usage

### Scopes

`AbstractFactory` resolves scopes via pluggable strategies:

- `@singletonScope` — one shared instance per factory (default when no scope is declared)
- `@prototypeScope` — a new instance on each `getValue()` resolution
- `@hashScope` — key-based contextual scope (explicit key activation required)
- `@refreshScope` — one cached instance per factory, discarded when the environment refreshes (`config:refresh`), so the next `getValue()` re-creates it — see [guide 03 §7](../../docs/guides/03-environment-configuration.md#7-live-rebind--refreshscope)
- `@scope('<name>')` — custom scope marker

Built-in names: `singleton`, `prototype`, `route` (implemented using key-based hash scope), `hash`, `refresh`. Custom scopes register through `ScopedFactory`: `registerScope(name, scope)`, `getScope(name)`, `getScopeNames()`, `destroyScopedValue(scopeName, valueName)`. Custom implementations conform to the `Scope` interface and use an object-factory callback pattern for lazy creation.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/factory build:lib
pnpm --filter @blue/factory test
```

## See Also

- [@blue/context](../blue-context/README.md) — application context on top of the factory
- [@blue/boot](../blue-boot/README.md) — `ApplicationBuilder` on top of the context

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
