# Guide 03 — Environment & Configuration

How configuration reaches your Ndigo application and becomes typed, validated
objects: property sources, precedence, profiles, and `@configurationProperties`
binding.

The environment is a pipeline: **sources** provide raw values →
**resolution** (lookup + profiles + placeholders) → **binding**
(`@configurationProperties` → typed instances) → **validation**
(`@environment` zod schemas). It is the reference framework's environment model, ported to
JavaScript-native structures with fail-loud semantics throughout.

**Audience:** Node and browser application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) (Node) or [guide 02](02-building-a-browser-app.md) (browser) · **Reference app:** `apps/05-ndigo-api`

## What you'll learn

- Order property sources and activate profiles correctly.
- Bind external values to typed `@configurationProperties` classes.
- Resolve placeholders and validate the environment at boot.
- Extend the environment with custom sources and customizers.
- Continue with [guide 43](43-live-configuration-and-secrets.md) for refresh, secrets, and remote config.

## The pipeline

```
        ┌───────── CLI ─────────┐   (highest precedence)
        ├─ builder properties ─┤
        ├─ process.env ────────┤
        ├─ configServer ───────┤   (remote JSON, §9)
        ├─ .env ───────────────┤   (reserved slot; no built-in reader)
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

| Source | Name | How it's set |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------- |
| Command line | `commandLine` | `app.run('--server.port=9000', '--debug')` |
| Builder properties | `boot` | `builder.properties({ server: { port: 8080 } })` |
| Process env | `systemEnvironment` | `process.env` (snapshot at construction) |
| Config server | `configServer` | `builder.configServer({ url, pollMs })` — remote JSON (see §9) |
| `.env` file | `dotenv` | reserved slot — **not auto-loaded** (no built-in reader; user-supplied, see below) |
| Config files | `application` | `./config/application.json` + profile variants (`.toon` opt-in, see below) |
| Defaults | `defaults` | `builder.defaults({...})` (always present, lowest) |

`dotenv` is a **reserved slot** in the documented chain (`PRECEDENCE` in
`@ndigo/boot`), not an auto-loaded source: nothing reads `.env` today . A stack that needs `.env` values
can parse the file in an environment customizer (§6) and register the values
as a named source in the reserved slot.

`getProperty('server.port')` consults this order; `originOf('server')` tells
you _which source won_ (the observability payoff). Origin tracking is a
**flat-index** feature — the default prototype-chain index retains no origins,
so the environment must be constructed with `{ index: 'flat' }` first (a
`NodeEnvironment` for a real app), and `originOf` reports at **top-level
granularity** (`server`, not `server.port`):

```ts
import { StandardEnvironment } from '@ndigo/context';

// The flat index retains origins; the default prototype-chain index does not.
const environment = new StandardEnvironment([], { index: 'flat' });
environment.getPropertySources().addLast('application', { server: { port: 8080 } });
// ...app.environment(environment) when booting through ApplicationBuilder...

environment.originOf('server'); // → 'application' | 'systemEnvironment' | ... (winning source)
environment.originOf('server.port'); // → 'application' — top-level granularity
environment.originOf('missing'); // → null
```

With the default index, `originOf` returns `null` (origins are not retained) —
a flat index is the documented configuration the example requires.

### Raw env reads — `getEnv` and `isDevMode`

Read `process.env` through the two accessors, never directly. Both live in
`@ndigo/util` and are re-exported from `@ndigo/context` (the C-14 single
accessor):

```ts
import { getEnv, isDevMode } from '@ndigo/context';

getEnv('PORT'); // undefined when unset
getEnv('PORT', '3000'); // fallback when unset
getEnv('DEBUG'); // '' is preserved — only a missing variable falls back
isDevMode(); // true unless NODE_ENV === 'production'
```

- `getEnv(name, fallback?)` returns `process.env[name]`, or `fallback` when
 the variable is unset. It is safe where no `process` global exists
 (browser/worker bundles) — the fallback (or `undefined`) is returned
 instead of throwing.
- `isDevMode` is the same guard applied to `NODE_ENV`: true in any
 environment except an explicit production build. It gates runtime
 warnings and dev-only code paths.

A direct `process.env.X` read bypasses this guard and breaks isomorphic
bundles — route every read through `getEnv`.

## 2. Profiles

Profiles gate config with `@whenProfile` — class registration or individual
entry methods — and file loading is profile-aware:

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

Activation (CLI > env > builder):

```sh
NDIGO_PROFILES_ACTIVE=prod node app.js                # env
node app.js --profiles.active=prod                   # CLI (wins)
NDIGO_PROFILES_GROUPS='short=dev,test' node app.js    # groups expand
```

Default profiles gate only when **nothing is explicit**:

```ts
const env = new StandardEnvironment();
env.addDefaultProfile('base');
env.acceptsProfiles('base'); // true — nothing explicit set
```

In-code gates compose with the `Profile` builder — canonical
strings, validated by the grammar at build time, parenthesized when
precedence would change the meaning. Multiple arguments mean **either-of**
and fold into one canonical expression at decoration time
(`@whenProfile('dev', 'test')` → `'dev | test'`):

```ts
import { Profile, whenProfile } from '@ndigo/core';

class DevToolsConfiguration {
    @whenProfile(Profile.and('dev', Profile.not('ci'))) // 'dev & !ci'
    @entry
    devTools() {
        /* … */
    }
}

env.acceptsProfiles(Profile.and(Profile.or('a', 'b'), 'c')); // '(a | b) & c'
```

`application-prod.json` loads above `application.json` when `prod` is active.

### TOON config files (opt-in, )

Config files may be authored in [TOON](https://github.com/toon-format/toon)
(spec v4.4) instead of JSON — same files, same deep-merge, same profiles:

```toon
# comments are allowed — the main reason to choose TOON
server:
  port: 8080
  host: localhost
environments[2:]{region,replicas}:
  production: eu-central-1,6
  staging: eu-central-1,2
```

`./config/application.toon` and `application-{profile}.toon` are probed when
no `.json` file of the same name wins the collision; the loader option
`format: 'json' | 'toon' | 'auto'` (default `auto`) restricts probing, and
`NDIGO_CONFIG_IMPORT` paths whose extension contradicts a restricted
`format` error out instead of silently parsing (imports inherit the rule).
A `.toon` document that starts like JSON (`{` or `[` at the first column)
errors with a rename hint. TOON documents decode to the JSON model, so
everything downstream — merge semantics, `{cipher:…}` secrets, zod schema
validation, typed binding — behaves identically. `@toon-format/toon` is an
**optional** dependency, loaded lazily only when a `.toon` file is found;
install it (`npm i @toon-format/toon@4.4.0`) to use TOON files. The
`text/toon` media type is provisional (not IANA-registered) — this opt-in
is a pre-1.0 authoring option, not a framework default.

### TOON from a URL (`ApplicationBuilder.fromConfig`, Phase 3)

`fromConfig(url)` follows the **address**: a `.toon` path suffix decodes the
document as TOON, everything else as JSON — JSON stays the default.

```ts
// .toon suffix → decoded as TOON (the address is the statement, not a default)
const app = await ApplicationBuilder.fromConfig('https://cdn.example/app/config.toon');
```

An explicit `format: 'json' | 'toon'` option overrides the address, with one
refused contradiction: `format: 'toon'` always decodes as TOON, while
`format: 'json'` over a `.toon` address errors instead of silently
re-parsing. A query string or fragment is stripped before detection, so a
cache-busting suffix cannot change the format and a `?x=.toon` query cannot
select it. `fromConfig` only fetches `http(s)` URLs, and the decode contract —
strict mode, JSON-shaped rename hint, object shape guard — is identical to
`.toon` config files, including the lazily loaded optional peer.

`sources` is a list of static source ids; `sourceCatalog` resolves them, so
the same catalog keys can be reused across environments without exposing the
`import` seam to untrusted content. A source id absent from the catalog is
an `IllegalStateError` at boot, never a silent skip.

## 3. Bind configuration to typed classes

`@configurationProperties` auto-registers a bound, converted singleton:

```ts
import { configuration, property, defaultValue, nestedConfig } from '@ndigo/context';
import { configurationProperties } from '@ndigo/boot';

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
    @property('host', String) @defaultValue('localhost') host!: string;
    @nestedConfig db: DbConfig = new DbConfig();
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
- `@nestedConfig` binds a sub-object under the field name (`db` → `server.db.url`).
- Missing-required or conversion failure **fails refresh** naming class.field.

### 3.1 Schema mode 

Declare the shape once as a zod schema and the class binds from it — keys,
coercion, requiredness and defaults all come from the schema:

```ts
import { z } from 'zod';
import { configurationProperties } from '@ndigo/boot';

const serverSchema = z.object({
    name: z.string().default('ndigo-api'),
    port: z.coerce.number().default(3000),
});

@configurationProperties('server', { schema: serverSchema })
class ServerConfig {
    name!: string; // no @property / @defaultValue needed
    port!: number;
}
```

- Each schema key resolves `${prefix}.${key}`; `z.coerce` converts the
 stringly env values, `z.default` fills missing keys, required keys fail
 boot naming the class (fail-loud, same as field mode).
- `@property`/`@defaultValue`/`@nestedConfig` are ignored in schema mode — the
 schema is the single source of truth.
- The relaxed (kebab/snake) fallback applies to kebab/snake _field paths_ in field-decorator mode; schema keys are camelCase shape keys resolved exactly as `${prefix}.${key}` — schema mode does not probe kebab spellings (D-3).

### 3.2 Typed reads — `typedConfig` and `propertyKeys` 

Programmatic reads get the same schema semantics on the context or
environment:

```ts
context.typedConfig('server', serverSchema); // z.infer → { name, port } | undefined
context.environment.typedConfig('server.port', z.coerce.number()); // leaf mode → number
```

`propertyKeys(shape)` types `@property` paths as template literals, so a
typo fails at compile time:

```ts
import { propertyKeys } from '@ndigo/context';
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
import { environment } from '@ndigo/context';

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
import { validateEnvironment } from '@ndigo/context';
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

`environment.refresh` recomputes from current sources (clears caches +
rebuilds); `NodeEnvironment.refresh` also re-snapshots `process.env`. An
environment refresh **emits `config:refresh`** — the trigger behind the live
rebind (next section).

## 7. Live configuration, secrets, and remote config

Live rebinding, at-rest `{cipher:...}` secrets, and the remote config server are
covered in [guide 43](43-live-configuration-and-secrets.md). Everything above is
the boot-time source/binding pipeline; everything in 43 is the running-app
surface.

## Editor support

`@ndigo/boot` ships a JSON Schema for the config-file convention so editors give
completion and validation for the framework keys with no language server:

```json
{
    "$schema": "../node_modules/@ndigo/boot/schema/application.schema.json",
    "server": { "port": 8080 },
    "profiles": { "active": ["prod"] },
    "api": { "secretToken": "{cipher:v1:…}" }
}
```

The `$schema` path is relative to the file that contains it: from an app's
`config/` directory the schema lives one level up under `node_modules`, so
`../node_modules/@ndigo/boot/schema/application.schema.json` is the correct
reference (adjust the `../` count if `config/` sits deeper). The schema is
**permissive by design** — application keys are unconstrained
(`additionalProperties: true` for the document, and the framework sections
accept arbitrary extra values) and no unknown key is ever rejected. It only
documents the framework namespaces below; profile files
(`application-{profile}.json`) are structurally identical and use the same
schema. The `{cipher:…}` marker is modeled as a marker **string**
(`$defs.secretMarker`, e.g. `"{cipher:v1:…}"`), not an ordinary object value
(§8). Sections that are **not** read from config files carry the custom
annotation `"x-ndigo-read-from-config": false` — their keys are editor
completion for a programmatic channel, not config-file keys (see the table).
The schema itself lives at
[`packages/ndigo-boot/schema/application.schema.json`](../../packages/ndigo-boot/schema/application.schema.json).

Documented framework keys. The **Read from** column is the authority: keys
marked with a CLI/env/builder/argument channel are _not_ read from
`config/application.json` (the `profiles` and `telemetry` sections are
annotated `"x-ndigo-read-from-config": false`; `management.*` is read by
`@ndigo/management`'s `ManagementProperties` reader — ):

| Key | Type | Default | Read from | Meaning |
| --------------------------------------- | ------------------------------------ | ---------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `server.name` | string | `ndigo-api` | Application `@configurationProperties('server')` class | Application/server name (the demo binds it; the framework does not). |
| `server.port` | integer | `3000` (`PORT` env) | Application `@configurationProperties('server')` class | TCP port to listen on (`0` requests an ephemeral port). |
| `server.host` | string | `127.0.0.1` | Not config-read — programmatic `HTTPServer({ host })` | Host/interface to bind to (platform-node `HTTPServer` default). |
| `profiles.active` | string[] | — | CLI `--profiles.active` / `NDIGO_PROFILES_ACTIVE` / builder | Profiles to activate. |
| `profiles.default` | string[] | — | CLI `--profiles.default` / `NDIGO_PROFILES_DEFAULT` | Fallback profiles used when nothing is active. |
| `profiles.group.<name>` | string[] | — | CLI `--profiles.group.<name>` / `NDIGO_PROFILES_GROUPS` | Profile group name → member profiles. |
| `telemetry.sampler` | `'always'` \| `'off'` \| `{ ratio }` | `always` | `configureTelemetry` argument | Root-span sampling (ratio in `[0, 1]`). |
| `telemetry.traceExporter` | exporter spec | `console` | `configureTelemetry` argument | Trace export: `console` \| `none` \| `{ url, headers? }` (OTLP/HTTP). |
| `telemetry.metricExporter` | exporter spec | `console` | `configureTelemetry` argument | Metric export — same spec as `traceExporter`, plus the metric-only `'prometheus'` literal: pull reader behind `/metrics`. |
| `telemetry.logExporter` | exporter spec | `console` | `configureTelemetry` argument | Log export — same spec as `traceExporter`. |
| `management.redactHealthErrors` | boolean | `true` | `ManagementAutoConfiguration(options)` constructor argument | Redact thrown health-indicator errors on `/health`. |
| `management.endpoints.exposure.include` | string[] | `["health","metrics"]` | `@ndigo/management` `readManagementSettings` (config read) | Management endpoint ids to serve (`*` = all; `loggers`/`env`/`configprops` are opt-in, ). |
| `management.endpoints.exposure.exclude` | string[] | — | `@ndigo/management` `readManagementSettings` (config read) | Management endpoint ids withheld; wins over `include` . |
| `management.endpoints.env.showValues` | boolean | `false` | `@ndigo/management` `readManagementSettings` (config read) | When true, `/env` emits the raw stored config text; decrypted plaintext is never served . |
| `management.health.groups` | `{ <name>: { include: string[] } }` | — | `@ndigo/management` `readManagementSettings` (config read) | Health groups served at `/health/<name>` aggregating the listed components . |

## See also

- [Guide 43 — Live Configuration, Secrets & Remote Config](43-live-configuration-and-secrets.md) — refresh, secrets, and the config server
- [Guide 01 — Building a Node API](01-building-a-node-api.md) for the surrounding bootstrap
- [Environment API](../reference/2026-09-08_ENVIRONMENT_API.md) for the full surface
- for the precedence, refresh, secrets, and config-server decisions
