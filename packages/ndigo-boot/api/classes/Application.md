[**@ndigo/boot v0.0.1**](../README.md)

***

[@ndigo/boot](../README.md) / Application

# Class: Application

Class that can be used to bootstrap and launch an application.

## Param

**name**

The name of the application

## Extends

- `Emitter`

## Constructors

### Constructor

> **new Application**(`sources`): `Application`

Creates an application bootstrapper for the given source classes.

#### Parameters

##### sources

`Function`[]

Source classes that will be registered when the application runs.

#### Returns

`Application`

#### Overrides

`Emitter.constructor`

## Properties

### destroyed

> **destroyed**: `boolean`

#### Inherited from

`Emitter.destroyed`

***

### every

> `readonly` `static` **every**: `string`

#### Inherited from

`Emitter.every`

***

### version

> `readonly` `static` **version**: `string`

#### Inherited from

`Emitter.version`

## Accessors

### configServerSource

#### Get Signature

> **get** **configServerSource**(): `RemotePropertySource` \| `null`

The active remote config source, when configured (AD-29 Wave 3).

##### Returns

`RemotePropertySource` \| `null`

The wired source, or `null` when no `configServer` is configured.

***

### sources

#### Get Signature

> **get** **sources**(): `Set`\<`Function`\>

Gets the source classes registered with this application bootstrapper.

##### Returns

`Set`\<`Function`\>

The registered source classes.

## Methods

### clear()

> **clear**(`type?`): `this`

Removes listeners for one type or for all types.

#### Parameters

##### type?

`EventType`

Optional event type to clear.

#### Returns

`this`

This emitter.

#### Inherited from

`Emitter.clear`

***

### close()

> **close**(): `void`

Closes the application and releases resources.

Emits `'closed'`, detaches the config-refresh rebind listener (and its
fail-loud handler) from the wired environment, then destroys the
emitter. Detaching also happens automatically when the application
context closes (CTX-05).

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Destroys the emitter and clears its listeners.

#### Returns

`void`

#### Inherited from

`Emitter.destroy`

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

`EventType`

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

`Emitter.emit`

***

### eventTypes()

> **eventTypes**(): `EventType`[]

Returns the event types with registered listeners.

#### Returns

`EventType`[]

The registered event types.

#### Inherited from

`Emitter.eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

`EventType`

The event type.

#### Returns

`number`

The listener count.

#### Inherited from

`Emitter.listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Returns a snapshot of listeners for a type.

#### Parameters

##### type

`EventType`

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Inherited from

`Emitter.listeners`

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

`EventType`

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Inherited from

`Emitter.off`

***

### on()

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

#### Parameters

##### type

`EventType` \| `EventHandlers`

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

`Emitter.on`

***

### run()

> **run**(...`args`): `Promise`\<`ConfigurableApplicationContext`\>

Runs the application and refreshes a new application context.

#### Parameters

##### args

...`string`[]

Command-line arguments used while preparing the environment.

#### Returns

`Promise`\<`ConfigurableApplicationContext`\>

The refreshed application context.

#### Throws

When application startup fails.

***

### setConfigFileLoader()

> **setConfigFileLoader**(`loader`): `void`

Sets the config-file loader used during environment preparation (AD-13).

#### Parameters

##### loader

[`StandardConfigFileLoader`](StandardConfigFileLoader.md) \| `null`

The loader, or `null` to disable file loading.

#### Returns

`void`

***

### setConfigServerOptions()

> **setConfigServerOptions**(`options`): `void`

Configures a remote config source (AD-29 Wave 3).

Fetch-once at boot and optional polling of a JSON document, merged into
the environment at the documented `configServer` precedence slot. When
`pollMs` is set, boot starts polling and stops it when the returned
context closes.

#### Parameters

##### options

`RemoteSourceOptions` \| `null`

The remote source configuration, or `null` to disable.

#### Returns

`void`

***

### setCustomizers()

> **setCustomizers**(`customizers`): `void`

Registers environment customizers, applied in registration order after
the environment is prepared and before the context reads it.

#### Parameters

##### customizers

readonly `EnvironmentCustomizer`[]

The customizers to run.

#### Returns

`void`

***

### setDefaults()

> **setDefaults**(`defaults`): `void`

Sets the default property source (lowest precedence; always present).

#### Parameters

##### defaults

`JSONObject`

The default property values.

#### Returns

`void`

***

### setEntryProcessors()

> **setEntryProcessors**(`processors`): `void`

Registers entry processors, applied to every entry instance the
context creates — including constructor entries eagerly created at
refresh end (`_finishFactoryInitialization`). Registration replaces
any previous processors (chained `processors(...)` calls do not
accumulate). Register at most one `@ndigo/proxy` interception
processor (see `ApplicationBuilder.processors`).

#### Parameters

##### processors

readonly `EntryProcessor`[]

The entry processors to register on the context
  before it refreshes.

#### Returns

`void`

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Sets the environment that will be reused instead of creating a new one.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to reuse.

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Sets the application name used when the application context is created.

#### Parameters

##### name

`string`

The application name.

#### Returns

`void`

***

### setProfiles()

> **setProfiles**(...`profiles`): `void`

Replaces the active profiles that will be applied before the context refreshes.

#### Parameters

##### profiles

...`string`[]

The profile names to activate.

#### Returns

`void`

***

### setProperties()

> **setProperties**(`properties`): `void`

Sets the property sources that will be added during environment preparation.

#### Parameters

##### properties

`JSONObject`

Property values to expose to the application environment.

#### Returns

`void`

***

### setSecretDecryptor()

> **setSecretDecryptor**(`decryptor`): `void`

Attaches an at-rest secret decryptor (AD-29 Wave 2).

Applied to the prepared environment in `_prepareEnvironment` (before the
context reads it), so `{cipher:...}` values resolve to plaintext for
`@configurationProperties` binding and every environment lookup.

#### Parameters

##### decryptor

`SecretDecryptor` \| `null`

The secret decryptor (e.g. a `SecretSchemeRegistry`).

#### Returns

`void`

***

### setValidationSchema()

> **setValidationSchema**(`schema`): `void`

Sets a zod schema the prepared environment must satisfy (fail-loud boot).

#### Parameters

##### schema

`ZodType`

The zod object schema of the environment's shape.

#### Returns

`void`

***

### toJSON()

> **toJSON**(): `JSONValue`

Serializes the listener counts to JSON.

#### Returns

`JSONValue`

A JSON representation of the emitter state.

#### Inherited from

`Emitter.toJSON`

***

### toString()

> **toString**(): `string`

Returns a compact textual summary of the emitter.

#### Returns

`string`

A string representation.

#### Inherited from

`Emitter.toString`
