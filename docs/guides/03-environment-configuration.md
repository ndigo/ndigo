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

In-code gates compose with the `Profile` builder (AD-34 D5) — canonical
strings, validated by the grammar at build time, parenthesized when
precedence would change the meaning:

```ts
import { Profile } from '@blue/context';

@profile(Profile.and('dev', Profile.not('ci'))) // 'dev & !ci'
@entry
devTools() { … }

env.acceptsProfiles(Profile.and(Profile.or('a', 'b'), 'c')); // '(a | b) & c'
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

### 3.1 Schema mode (AD-34 D3)

Declare the shape once as a zod schema and the class binds from it — keys,
coercion, requiredness and defaults all come from the schema:

```ts
import { z } from 'zod';
import { configurationProperties } from '@blue/boot';

const serverSchema = z.object({
    name: z.string().default('blue-api'),
    port: z.coerce.number().default(3000),
});

@configurationProperties('server', { schema: serverSchema })
class ServerConfig {
    name!: string; // no @property / @defaultValue needed
    port!: number;
}
```

- Each schema key resolves `${prefix}.${key}`; `z.coerce` converts the
  stringly env values, `z.default()` fills missing keys, required keys fail
  boot naming the class (fail-loud, same as field mode).
- `@property`/`@defaultValue`/`@nested` are ignored in schema mode — the
  schema is the single source of truth.
- The relaxed (kebab/snake) fallback applies to schema keys too.

### 3.2 Typed reads — `typedConfig` and `propertyKeys` (AD-34 D3/D4)

Programmatic reads get the same schema semantics on the context or
environment:

```ts
context.typedConfig('server', serverSchema); // z.infer → { name, port } | undefined
context.environment.typedConfig('server.port', z.coerce.number()); // leaf mode → number
```

`propertyKeys(shape)` types `@property` paths as template literals, so a
typo fails at compile time:

```ts
import { propertyKeys } from '@blue/context';
const keys = propertyKeys({ server: { name: '', port: 0 } });
@property(keys.server.port, Number) port!: number; // 'server.port'
```

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
rebuilds); `NodeEnvironment.refresh()` also re-snapshots `process.env`. An
environment refresh **emits `config:refresh`** — the trigger behind the live
rebind (next section).

## 7. Live rebind — `@refreshScope`

Configuration is no longer a boot-time snapshot: environments emit
`config:refresh` after every `refresh()`, and beans opt in to re-binding on
it. Mark a `@configurationProperties` class:

```ts
import { refreshScope, configurationProperties, property } from '@blue/context';

@refreshScope // re-binds on every environment refresh
@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
}
```

- `@refreshScope` = a scope (`scope('refresh')`): its cached instance is
  discarded on `config:refresh`; the next `getValue` re-creates from the
  factory.
- The boot rebind listener re-runs `resolveConfigurationProperties` +
  `setValue` for refresh-scoped classes — `getValue('serverConfig')` returns
  the fresh snapshot; unmarked classes keep the boot-time instance
  (snapshot identity).
- Scope-level beans (constructor-registered classes) clear their caches on
  the event too.
- **Freshness is on re-fetch, not on the reference**: a bean that captured
  a config object in its constructor keeps the old object until it
  re-looks up. No proxy machinery (repo posture) — documented, deliberate.
- Coverage is config classes only in v1 (AD-29 D-2); `@entry` method
  results are not re-run.

#### Refresh snapshot semantics

`config:refresh` re-binds the opt-in surface only — it does **not**
re-inject consumers. After a refresh:

- singleton beans and consumers that captured a value **at construction**
  keep the **old** value for their lifetime;
- only `@refreshScope` beans and re-bound `@configurationProperties` names
  see the new values (from their next lookup);
- a bean that injects the environment / property accessor (or reads
  `environment.getPropertyAs(...)` at call time) always observes the
  current source state.

The recommended consumer pattern is therefore to **inject the environment
(or another property accessor) rather than the value**: reads at call time
see fresh state after any number of refreshes, while captured values go
stale the moment a refresh lands. Dependency re-injection of captured
values is a designed follow-up (plan ARC-3) — v1 consumers must re-look-up
or read through the environment.

Implementation note: `@refreshScope` is realized by **two listeners** —
the context's scope-clear (`RefreshScope.clear()` on `config:refresh`) and
boot's config-class rebind (`resolveConfigurationProperties` + `setValue`)
— whose relative order is their subscription order.

## 8. At-rest secrets — `{cipher:...}` values and `BLUE_SECRET_KEY`

Encrypted config values keep secrets out of repos/backups/logs: the
**ciphertext** lives in the file, the **key** lives in a separate channel.
This defends read-only access to stored artifacts (repo leak, backup, paste)
— it does NOT defend against full host compromise (documented threat model,
AD-29 D-4).

```ts
// application.json (ciphertext is safe to commit)
{ "db": { "password": "{cipher:v1:…}" } }

// Node bootstrap: key + decryptor wiring
const app = new ApplicationBuilder([...]);
app.secrets(AESGCMCipher.fromEnvironment()); // reads BLUE_SECRET_KEY
```

- `BLUE_SECRET_KEY` is base64 of **exactly 32 bytes** (AES-256); malformed
  or wrong length fails at construction, never a passive field. Passphrases
  are rejected.
- Values resolve to plaintext at every lookup and in
  `@configurationProperties` binding; the key path (`db.password`) is bound
  as GCM AAD — moving a ciphertext between keys fails auth at lookup.
- Fail-loud everywhere: wrong key, tampered value, or an unknown
  marker scheme throws; decrypted values never reach error text or logs.
- The marker's `scheme` segment is the dispatch key — a deployment can mix
  schemes (old `cipher:v1` + future `jwe:` values) during migration; an
  adapter whose capabilities can't honor key-path AAD is refused at wiring.
- With no decryptor wired, markers pass through as raw text (local binding
  does not fail) — the two-channel posture is deployer-driven, not
  enforced; wires are the signal.

## 9. Config server — remote sources and the poll loop

Fetch a plain JSON document over HTTPS and make it a named source — changes
merge live and rebind refresh-scoped beans:

```ts
builder.configServer({
    url: 'https://config.internal/blue-api.json', // https enforced
    pollMs: 30_000, // 0/absent = fetch once
    headers: { Authorization: `Bearer ${process.env.BLUE_CONFIG_SERVER_TOKEN}` },
    optional: false, // fail boot when unreachable
});
```

- Precedence slot: `commandLine > boot > systemEnvironment > configServer >
dotenv > application-{profile} > application > defaults` (documented
  chain, pinned by a real-boot order spec).
- **Change detection**: ETag/`If-None-Match` (304 → nothing happens) or
  body-text comparison. A real change replaces the source in place and
  fires `environment.refresh()` → `config:refresh` → `@refreshScope` beans
  rebind. No change → no event → no rebinding.
- `optional: true` (default): a dead server at boot warns and proceeds on
  local sources; later poll failures keep last-good. `optional: false`
  fails startup loudly naming the URL.
- `{cipher:...}` values inside a fetched document decrypt when `secrets(...)`
  is also wired.
- Lifecycle: polling starts after boot succeeds and stops when the returned
  context closes.
- Runtime delivery (e.g. Vault): use a custom `fetch` seam with a
  `vault://`-style URL — documented extension point, no Vault-specific
  code in v1 (AD-29 D-3 rung 5).

## Recommended reading

- Guide 01 (building a node API) for the surrounding bootstrap
- Reference: Environment API for the full surface
- Environment decisions: precedence chain, profiles, configuration binding, origins & refresh, validation, secrets, config server, live rebind (AD-29)
