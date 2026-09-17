# Blue Context

The BlueJS application context: dependency container, configuration
decorators, property sources, environment, and resource/event infrastructure.

## Features

- **`ApplicationContext`** — the IoC container (`getValue`, `setValue`,
  `hasValue`, lifecycle-aware registration) with factory scope support
  (`@blue/factory`): `@singletonScope`, `@prototypeScope`, `@hashScope`
- **Configuration decorators** — TC39 metadata-based wiring: `@configuration`,
  `@entry`, profile gating (`@profile('dev')`), environment validation
  (`@environment` with zod schemas), origins and customizers
- **Property sources** — named, ordered sources (env, CLI, files) with
  placeholder resolution and a strategy `PropertyIndex` (prototype-chain by
  default), `@Value`-style typed lookup
- **Environment + profiles** — full profile activation (defaults, expressions)
  and typed config binding (`@configurationProperties` v2)
- **Resource & events** — `ResourceLoader`/`Resource` abstractions, in-memory
  loaders, event emitters and context-aware mixins

## Usage

```ts
import { MetadataConfigApplicationContext, configuration, entry } from '@blue/context';

@configuration
class AppConfig {
    @entry greetingService() {
        return new GreetingService();
    }
}

const context = new MetadataConfigApplicationContext('app');
context.register(AppConfig);
context.refresh();

const service = context.getValue<GreetingService>('greetingService');
```

## See Also

- [@blue/factory](../blue-factory/README.md) — factory scope and lifecycle
- [@blue/boot](../blue-boot/README.md) — `ApplicationBuilder` on top of the
  context
- [@blue/test](../blue-test/README.md) — boots real contexts in tests
