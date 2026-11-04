# Ndigo Dispatcher

> Platform-independent request dispatch for Ndigo: maps routes to handlers, binds parameters, runs interceptors, resolves errors, renders views.

Platform-independent request dispatch for Ndigo: maps routes to handler methods, binds parameters, runs interceptors, resolves errors, and renders the resulting view.

## Installation

```bash
pnpm add @ndigo/dispatcher
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { configuration } from '@ndigo/context';
import { requestMapping, getMapping, parameters } from '@ndigo/dispatcher';
import { pathVariable, queryValue, bodyValue, asNumber } from '@ndigo/dispatcher';

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
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of Ndigo.

- **Decorators** — `@requestMapping`, `@getMapping`, `@socketMapping`, `@parameters`
- **Parameter helpers** — `pathVariable`, `queryValue`, `bodyValue`, `attributeValue`, `requestSessionValue`; converters `asNumber`, `asJson`, `asUUID`
- **Core classes** — `RadixMetadataHandlerMapping`, `ModelAndView`

## Development

```bash
pnpm --filter @ndigo/dispatcher build:lib
pnpm --filter @ndigo/dispatcher test
```

## See Also

- [@ndigo/view](../ndigo-view/README.md) — the view layer dispatcher renders
- [@ndigo/router](../ndigo-router/README.md) — browser routing primitives
- [@ndigo/platform-node](../ndigo-platform-node/README.md) — `NodeDispatcher` writes rendered output to the HTTP response
- [@ndigo/platform-web](../ndigo-platform-web/README.md) — browser dispatch

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
