# Blue Boot

Application startup for BlueJS: profile-aware bootstrapping, typed config
binding, and environment auto-configuration.

## Features

- **`Application` / `ApplicationBuilder`** — lifecycle bootstrap: register
  configurations, activate profiles (`ApplicationBuilder.profiles('dev')`),
  and run
- **Environment + profiles** — profile activation with defaults and
  expressions; `@profile('dev')`-gated beans (AD-14)
- **Typed config binding v2** — `@configurationProperties` class binding with
  zod schema validation (`@environment`)
- **Config sources & precedence** — standard environment/file/CLI sources
  with documented precedence, placeholder resolution
- **Auto-configuration** — provisions platform components by environment:
    - _Node_: `NodeAutoConfiguration` (argument resolvers, converter registry,
      metadata handler mapping, error-resolver chain, managed `HTTPServer`)
    - _Browser_: Web auto-configuration (cookie/model/session/state resolvers,
      built-in converters)

## Usage

```ts
import { ApplicationBuilder } from '@blue/boot';
import { MyConfiguration } from './my-configuration';

const app = new ApplicationBuilder([MyConfiguration]).profiles('dev').run();
```

## Development

```bash
pnpm --filter @blue/boot build:lib
pnpm --filter @blue/boot test
```

## See Also

- [@blue/context](../blue-context/README.md) — the context underneath
- [@blue/platform-node](../blue-platform-node/README.md) — the Node
  auto-configuration provisions this on Node
