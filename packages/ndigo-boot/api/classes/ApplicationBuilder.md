[**@ndigo/boot v0.0.1**](../README.md)

***

[@ndigo/boot](../README.md) / ApplicationBuilder

# Class: ApplicationBuilder

Builder for configuring and running an application bootstrap sequence.

## Constructors

### Constructor

> **new ApplicationBuilder**(`sources`, `parent?`): `ApplicationBuilder`

Creates a builder for the provided application source classes.

#### Parameters

##### sources

`Function`[]

Source classes that should be included in the application.

##### parent?

`ApplicationBuilder` \| `null` = `null`

Optional parent builder used to share configuration.

#### Returns

`ApplicationBuilder`

## Accessors

### application

#### Get Signature

> **get** **application**(): [`Application`](Application.md)

Gets the configured application instance.

##### Returns

[`Application`](Application.md)

The application built by this builder.

***

### configServerSource

#### Get Signature

> **get** **configServerSource**(): `RemotePropertySource` \| `null`

The active remote config source, when configured (AD-29 Wave 3).

##### Returns

`RemotePropertySource` \| `null`

The wired source (exposed for observability and tests).

***

### context

#### Get Signature

> **get** **context**(): `ConfigurableApplicationContext`

Gets the application context created by the builder after the first run.

##### Returns

`ConfigurableApplicationContext`

The cached application context, if the builder has already run.

## Methods

### build()

> **build**(): [`Application`](Application.md)

Builds the configured application instance.

#### Returns

[`Application`](Application.md)

The configured application.

***

### child()

> **child**(...`sources`): `ApplicationBuilder`

Creates a child builder that inherits configuration from this builder.

#### Parameters

##### sources

...`Function`[]

Source classes to register on the child application.

#### Returns

`ApplicationBuilder`

A child application builder.

***

### configFiles()

> **configFiles**(`loader`): `ApplicationBuilder`

Sets the config-file loader used during environment preparation.

#### Parameters

##### loader

[`StandardConfigFileLoader`](StandardConfigFileLoader.md)

The loader (supply a reader to enable file loading).

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### configServer()

> **configServer**(`options`): `ApplicationBuilder`

Configures a remote config source (AD-29 Wave 3).

Fetches a plain JSON document over HTTPS at boot (and optionally polls
it) into the `configServer` precedence slot:
`commandLine > boot > systemEnvironment > configServer > dotenv >
application-{profile} > application > defaults`. Changes merge at
poll time and trigger `environment.refresh()` → `@refreshScope` beans
rebind (D-8 loop). `{cipher:...}` values in a fetched document decrypt
when `secrets(...)` is also wired (the "remote values decrypt too"
decision).

Auth via static headers — source the token from env
(`NDIGO_CONFIG_SERVER_TOKEN`), never from `application.json`; the token
header is itself a secret.

#### Parameters

##### options

`RemoteSourceOptions`

The remote source configuration.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### customizers()

> **customizers**(...`customizers`): `ApplicationBuilder`

Registers environment customizers, applied after the environment is
prepared and before the context reads it (registration order).

#### Parameters

##### customizers

...`EnvironmentCustomizer`[]

The customizers to run.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### defaults()

> **defaults**(`defaults`): `ApplicationBuilder`

Sets the default property source (lowest precedence).

#### Parameters

##### defaults

`JSONObject`

The default property values.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### environment()

> **environment**(`environment`): `ApplicationBuilder`

Sets the environment used when the application prepares its context.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to use for the application.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### on()

> **on**(`event`, `listener`): `this`

Registers an event listener on the application, enabling lifecycle hooks.
Returns `this` for chaining with [run](#run).

#### Parameters

##### event

`string`

The event name (e.g. `'started'`, `'closed'`).

##### listener

`EventListener`

The callback invoked when the event fires.

#### Returns

`this`

This builder instance for chaining.

#### Example

```ts
ApplicationBuilder.from(MyConfig)
  .on('started', (ctx) => console.log('Ready', ctx))
  .run();
```

***

### parent()

> **parent**(...`sources`): `ApplicationBuilder`

Returns the parent builder, creating one if necessary.

#### Parameters

##### sources

...`Function`[]

Source classes for a newly created parent builder.

#### Returns

`ApplicationBuilder`

The parent builder.

***

### processors()

> **processors**(...`processors`): `ApplicationBuilder`

Registers entry processors on the application context before it
refreshes. Every entry the context creates is processed — including
constructor entries eagerly created at refresh end.

The natural consumer is container-managed method interception
(`@ndigo/proxy`):

```ts
const audit = new AuditInterceptor();
const builder = new ApplicationBuilder([NodeAppConfiguration])
    .processors(interception([audit]));
```

Replaces any previously registered processors (chained calls do not
accumulate). Register **at most one** `interception(...)` processor
and combine all interceptors in that single call — combining across
calls silently drops advice, and a second `interception(...)`
processor fails loudly when it meets an already-woven entry (see
`@ndigo/proxy`).

#### Parameters

##### processors

...`EntryProcessor`[]

The entry processors to register.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### profiles()

> **profiles**(...`profiles`): `ApplicationBuilder`

Adds active profiles to the application configuration.

#### Parameters

##### profiles

...`string`[]

Profile names to activate.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### properties()

> **properties**(`properties`): `ApplicationBuilder`

Merges properties into the application configuration.

#### Parameters

##### properties

`JSONObject`

Property values to add to the environment.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### run()

> **run**(...`args`): `Promise`\<`ConfigurableApplicationContext`\>

Runs the configured application once and caches the resulting context.

#### Parameters

##### args

...`string`[]

Command-line arguments passed to the application.

#### Returns

`Promise`\<`ConfigurableApplicationContext`\>

A promise resolving to the application context (file loading is async).

***

### secrets()

> **secrets**(`cipher`): `ApplicationBuilder`

Enables at-rest secret decryption for this application (AD-29 Wave 2).

Registers a cipher backend so `{cipher:...}` values in any source
(config files, env, CLI, and — in Wave 3 — the config server) resolve
to plaintext at lookup and binding time. The cipher's capability gate
runs here: a backend that cannot supply key-path AAD binding is refused
loudly (pluggability never downgrades the threat model).

Node apps conventionally pass `AESGCMCipher.fromEnvironment()` (reads
`NDIGO_SECRET_KEY`); the builder stays isomorphic and accepts any
[SecretCipher](#).

#### Parameters

##### cipher

[`SecretCipher`](#)

The cipher backend to register (e.g. `AESGCMCipher`).

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### sources()

> **sources**(`sources`): `ApplicationBuilder`

Adds source classes to the application configuration.

#### Parameters

##### sources

`Function`[]

Source classes to register.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### validateWith()

> **validateWith**(`schema`): `ApplicationBuilder`

Declares a zod schema the prepared environment must satisfy — boot
fails loudly with the aggregate report when invalid (AD-17 D3).

#### Parameters

##### schema

`ZodType`

The zod object schema of the environment's shape.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### fromConfig()

> `static` **fromConfig**(`url`): `Promise`\<`ApplicationBuilder`\>

Creates a builder from a JSON configuration URL.

Fetches the JSON config from the given URL and uses the top-level
`sources`, `profiles`, and `properties` keys to bootstrap the application.

The `sources` array is expected to contain module specifiers that can be
dynamically imported as configuration classes.

#### Parameters

##### url

`string` \| `URL`

URL pointing to a JSON configuration file.

#### Returns

`Promise`\<`ApplicationBuilder`\>

A promise resolving to the configured builder.

#### Example

```ts
// config.json:
// {
//   "sources": ["@ndigo/AppConfig"],
//   "profiles": ["production"],
//   "properties": { "server.port": 8080 }
// }

const app = await ApplicationBuilder.fromConfig('/config.json');
app.run();
```
