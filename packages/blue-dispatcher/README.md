# BlueJS Dispatcher

Platform-independent request dispatch for BlueJS: maps routes to handler
methods, binds parameters, runs interceptors, resolves errors, and renders
the resulting view.

## Features

- **Metadata-driven handler mapping** — `@requestMapping`/`@getMapping`/…
  decorators registered through a radix tree (`RadixMetadataHandlerMapping`),
  with route conditions (matrix params, query params, patterns)
- **Explicit parameter binding** — `@parameters` with typed extractors
  (`pathVariable`, `queryValue`, `bodyValue`, `attributeValue`, `sessionValue`,
  …) wrapped by converters (`asNumber`, `asJson`, `asUUID`, …); resolver
  selection is cached per parameter
- **Handler adapters** — controller/handler-method adapters with interceptor
  chains (`applyPreHandle`/`applyPostHandle`)
- **View routing** — `ModelAndView` results handed to the view-resolution
  strategy (language, theme, content negotiation)
- **Error resolution** — pluggable error resolvers (401/403 denials,
  binding errors, last-resort 500)
- **WebSocket endpoints** — `@socketMapping` on the same condition API
- **Performance** — route lookup through a radix tree is 3–6x faster than
  popular router libraries on parameterized paths

## Usage

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

Platform-specific dispatchers extend the same core:

- [@blue/platform-node](../blue-platform-node/README.md) — `NodeDispatcher`
  writes rendered output to the HTTP response
- [@blue/platform-web](../blue-platform-web/README.md) — browser dispatch

## Development

```bash
pnpm --filter @blue/dispatcher build:lib
pnpm --filter @blue/dispatcher test
# benchmark route matching and parameter binding
pnpm --filter @blue/dispatcher test:bench
```

## See Also

- [@blue/view](../blue-view/README.md) — the view layer dispatcher renders
- [@blue/router](../blue-router/README.md) — browser routing primitives
