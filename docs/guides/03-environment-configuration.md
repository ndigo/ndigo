# Guide 03 — Environment & Configuration

How configuration reaches your BlueJS application and becomes typed, validated
objects: property sources, precedence, profiles, and `@configurationProperties`
binding.

The environment is a pipeline: **sources** provide raw values →
**resolution** (lookup + profiles + placeholders) → **binding**
(`@configurationProperties` → typed instances) → **validation**
(`@environment` zod schemas). It is Spring's environment model, ported to
JavaScript-native structures with fail-loud semantics throughout.

## The pipeline

```
        ┌───────── CLI ─────────┐   (highest precedence)
        ├─ builder properties ─┤
        ├─ process.env ────────┤
        ├─ .env ───────────────┤
        ├─ application-{profile}.json ─┐
        ├─ application.json ───────────┤  (deep-merged, profile-aware)
        └─ defaults ──────────────────┘   (lowest)
                        │
        Environment (getProperty / getPropertyAs / acceptsProfiles)
                        │
        @configurationProperties → bound, typed instance (auto-registered)
                        │
        @environment zod schema → fail-loud boot if invalid
```

## 1. The precedence chain

Sources are **named and ordered** — higher wins:

| Source             | Name                | How it's set                                       |
| ------------------ | ------------------- | -------------------------------------------------- |
| Command line       | `commandLine`       | `app.run('--server.port=9000', '--debug')`         |
| Builder properties | `boot`              | `builder.properties({ server: { port: 8080 } })`   |
| Process env        | `systemEnvironment` | `process.env` (snapshot at construction)           |
| `.env` file        | `dotenv`            | auto-loaded (never overrides a set env var)        |
| Config files       | `application`       | `./config/application.json` + profile variants     |
| Defaults           | `defaults`          | `builder.defaults({...})` (always present, lowest) |

`getProperty('server.port')` consults this order; `originOf('server')` tells
you _which source won_ (the observability payoff):

```ts
environment.originOf('server'); // → 'commandLine' | 'systemEnvironment' | ...
```

## 2. Profiles

Profiles gate config with expressions, and file loading is profile-aware:

```ts
import { configuration, entry, profile } from '@blue/context';

@configuration
class AppConfiguration {
    @entry
    @profile('dev | (test & !ci)') // expressions, not just exact names
    devTools() {
        return new DevToolsGate();
    }
}
```

Activation (CLI > env > builder):

```sh
BLUE_PROFILES_ACTIVE=prod node app.js                # env
node app.js --profiles.active=prod                   # CLI (wins)
BLUE_PROFILES_GROUPS='short=dev,test' node app.js    # groups expand
```

Default profiles gate only when **nothing is explicit**:

```ts
const env = new StandardEnvironment();
env.addDefaultProfile('base');
env.acceptsProfiles('base'); // true — nothing explicit set
```

`application-prod.json` loads above `application.json` when `prod` is active.

## 3. Bind configuration to typed classes

`@configurationProperties` auto-registers a bound, converted singleton:

```ts
import { configuration, property, defaultValue, nested } from '@blue/context';
import { configurationProperties } from '@blue/boot';

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
    @property('host', String) @defaultValue('localhost') host!: string;
    @nested db: DbConfig = new DbConfig();
}

class DbConfig {
    @property('url', String) @defaultValue('postgres://localhost') url!: string;
}

@configuration
class AppConfig {} // register the app; ServerConfig is bound too
// ...
const serverConfig = await app.run(); // auto-registered
const port = serverConfig.getValue('serverConfig').port; // number, fail-loud
```

- `@property(path, Type)` declares the conversion target (Number/Boolean/Date/String).
- `@defaultValue('...')` is string-then-converted, same path as real values.
- `@nested` binds a sub-object under the field name (`db` → `server.db.url`).
- Missing-required or conversion failure **fails refresh** naming class.field.

## 4. Placeholders & typed reads

```ts
environment.getProperty('endpoint'); // 'https://${HOST:local.dev}/api'
environment.getPropertyAs('port', Number); // 8080 (string → number)
environment.getRequiredPropertyAs('port', Number); // throws if missing/unconvertible
```

Placeholders support `${key}`, `${key:default}`, nesting, and cycle detection;
unresolvable ones pass through literally (no escape syntax — a literal
`${x}` is self-escaped when `x` is not a property).

## 5. Validate the environment

```ts
import { z } from 'zod';
import { environment } from '@blue/context';

@environment(
    z.object({
        server: z.object({ port: z.coerce.number().min(1) }),
        mode: z.string().optional(),
    })
)
class AppConfig {}
```

Boot now **fails loudly with every violation listed** (path, expected,
actual) — aggregate, not first-error. Ad-hoc:

```ts
import { validateEnvironment } from '@blue/context';
const { valid, issues } = validateEnvironment(environment, schema);
```

## 6. Extending the environment

Customizers adjust the prepared environment before the context reads it —
reorder sources, inject test doubles:

```ts
builder.customizers({
    customize(environment) {
        environment.getPropertySources().addFirst('stub', { server: { port: 1 } });
    },
});
```

`environment.refresh()` recomputes from current sources (clears caches +
rebuilds); `NodeEnvironment.refresh()` also re-snapshots `process.env`.

## Recommended reading

- Guide 01 (building a node API) for the surrounding bootstrap
- Reference: Environment API for the full surface
- Environment decisions: precedence chain, profiles, configuration binding, origins & refresh, validation
