[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / ApplicationBuilder

# Class: ApplicationBuilder

Defined in: packages/blue-boot/src/application-builder.ts:12

Builder for configuring and running an application bootstrap sequence.

## Constructors

### Constructor

> **new ApplicationBuilder**(`sources`, `parent?`): `ApplicationBuilder`

Defined in: packages/blue-boot/src/application-builder.ts:46

Creates a builder for the provided application source classes.

#### Parameters

##### sources

`Function`[]

Source classes that should be included in the application.

##### parent?

`ApplicationBuilder` \| `null`

Optional parent builder used to share configuration.

#### Returns

`ApplicationBuilder`

## Accessors

### application

#### Get Signature

> **get** **application**(): [`Application`](Application.md)

Defined in: packages/blue-boot/src/application-builder.ts:27

Gets the configured application instance.

##### Returns

[`Application`](Application.md)

The application built by this builder.

***

### context

#### Get Signature

> **get** **context**(): `ApplicationContext`

Defined in: packages/blue-boot/src/application-builder.ts:36

Gets the application context created by the builder after the first run.

##### Returns

`ApplicationContext`

The cached application context, if the builder has already run.

## Methods

### build()

> **build**(): [`Application`](Application.md)

Defined in: packages/blue-boot/src/application-builder.ts:60

Builds the configured application instance.

#### Returns

[`Application`](Application.md)

The configured application.

***

### child()

> **child**(...`sources`): `ApplicationBuilder`

Defined in: packages/blue-boot/src/application-builder.ts:70

Creates a child builder that inherits configuration from this builder.

#### Parameters

##### sources

...`Function`[]

Source classes to register on the child application.

#### Returns

`ApplicationBuilder`

A child application builder.

***

### fromConfig()

> `static` **fromConfig**(`url`): `Promise`\<`ApplicationBuilder`\>

Defined in: packages/blue-boot/src/application-builder.ts:104

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
//   "sources": ["@blue/AppConfig"],
//   "profiles": ["production"],
//   "properties": { "server.port": 8080 }
// }

const app = await ApplicationBuilder.fromConfig('/config.json');
app.run();
```

***

### environment()

> **environment**(`environment`): `ApplicationBuilder`

Defined in: packages/blue-boot/src/application-builder.ts:144

Sets the environment used when the application prepares its context.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to use for the application.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### parent()

> **parent**(...`sources`): `ApplicationBuilder`

Defined in: packages/blue-boot/src/application-builder.ts:156

Returns the parent builder, creating one if necessary.

#### Parameters

##### sources

...`Function`[]

Source classes for a newly created parent builder.

#### Returns

`ApplicationBuilder`

The parent builder.

***

### profiles()

> **profiles**(...`profiles`): `ApplicationBuilder`

Defined in: packages/blue-boot/src/application-builder.ts:170

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

Defined in: packages/blue-boot/src/application-builder.ts:185

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

> **run**(...`args`): `ApplicationContext`

Defined in: packages/blue-boot/src/application-builder.ts:198

Runs the configured application once and caches the resulting context.

#### Parameters

##### args

...`string`[]

Command-line arguments passed to the application.

#### Returns

`ApplicationContext`

The application context.

***

### sources()

> **sources**(`sources`): `ApplicationBuilder`

Defined in: packages/blue-boot/src/application-builder.ts:214

Adds source classes to the application configuration.

#### Parameters

##### sources

`Function`[]

Source classes to register.

#### Returns

`ApplicationBuilder`

This builder for chaining.

***

### on()

> **on**(`event`, `listener`): `this`

Defined in: packages/blue-boot/src/application-builder.ts:239

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
