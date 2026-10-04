# BlueJS Dispatcher

> Platform-independent request dispatch for BlueJS: maps routes to handlers, binds parameters, runs interceptors, resolves errors, renders views.

Platform-independent request dispatch for BlueJS: maps routes to handler methods, binds parameters, runs interceptors, resolves errors, and renders the resulting view.

## Installation

```bash
pnpm add @blue/dispatcher
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { configuration } from '@blue/context';
import { requestMapping, getMapping, parameters } from '@blue/dispatcher';
import { pathVariable, queryValue, bodyValue, asNumber } from '@blue/dispatcher';

@requestMapping('/api')
class GreetingController {
    @getMapping('/greet/:name')
    @parameters({ name: pathVariable('name'), lang: queryValue('lang') })
    greet({ name, lang }) {
        return `Hello, ${name}!`;
    }
}

@configuration
class AppConfig {
    // the dispatcher + radix handler mapping are auto-wired by the
    // platform auto-configuration (NodeAutoConfiguration / boot)
}
```

## Usage

### Parameter binding

`@parameters` uses typed extractors (`pathVariable`, `queryValue`, `bodyValue`, `attributeValue`, `requestSessionValue`) wrapped by converters (`asNumber`, `asJson`, `asUUID`); resolver selection is cached per parameter.

### Conditions, interceptors, errors

Handlers match on route conditions (matrix params, query params, patterns), run interceptor chains (`applyPreHandle`/`applyPostHandle`), and resolve errors through pluggable resolvers (401/403 denials, binding errors, last-resort 500). Route lookup through a radix tree is 3–6x faster than popular router libraries on parameterized paths.

Route conditions and `RouteMappingInfo` implement the core
`ResultMatcher<Route, Result>` contract: `match(route)` returns a narrowed result
or `null`. Use that result directly; there is no separate boolean matching pass.
The former `getMatchingCondition` method has been removed. Custom conditions must
implement `match` instead. Context-dependent `compareTo(other, route)` is unchanged.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **Decorators** — `@requestMapping`, `@getMapping`, `@socketMapping`, `@parameters`
- **Parameter helpers** — `pathVariable`, `queryValue`, `bodyValue`, `attributeValue`, `requestSessionValue`; converters `asNumber`, `asJson`, `asUUID`
- **Core classes** — `RadixMetadataHandlerMapping`, `ModelAndView`

## Development

```bash
pnpm --filter @blue/dispatcher build:lib
pnpm --filter @blue/dispatcher test
```

## See Also

- [@blue/view](../blue-view/README.md) — the view layer dispatcher renders
- [@blue/router](../blue-router/README.md) — browser routing primitives
- [@blue/platform-node](../blue-platform-node/README.md) — `NodeDispatcher` writes rendered output to the HTTP response
- [@blue/platform-web](../blue-platform-web/README.md) — browser dispatch

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
