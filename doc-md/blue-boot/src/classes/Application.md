[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / Application

# Class: Application

Defined in: packages/blue-boot/src/application.ts:22

Class that can be used to bootstrap and launch an application.

## Param

The name of the application

## Fires

started when the application context is ready

## Fires

closed when the application is closed

## Extends

- `Emitter`

## Constructors

### Constructor

> **new Application**(`sources`): `Application`

Defined in: packages/blue-boot/src/application.ts:44

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

### every

> `readonly` `static` **every**: `string`

Defined in: packages/blue-context/lib/event-emitter.d.ts:183

#### Inherited from

`Emitter.every`

***

### version

> `readonly` `static` **version**: `string`

Defined in: packages/blue-context/lib/event-emitter.d.ts:184

#### Inherited from

`Emitter.version`

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-context/lib/event-emitter.d.ts:185

#### Inherited from

`Emitter.destroyed`

## Accessors

### sources

#### Get Signature

> **get** **sources**(): `Set`\<`Function`\>

Defined in: packages/blue-boot/src/application.ts:35

Gets the source classes registered with this application bootstrapper.

##### Returns

`Set`\<`Function`\>

The registered source classes.

## Methods

### run()

> **run**(...`args`): `ConfigurableApplicationContext`

Defined in: packages/blue-boot/src/application.ts:57

Runs the application and refreshes a new application context.

#### Parameters

##### args

...`string`[]

Command-line arguments used while preparing the environment.

#### Returns

`ConfigurableApplicationContext`

The refreshed application context.

#### Throws

When application startup fails.

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-boot/src/application.ts:77

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

Defined in: packages/blue-boot/src/application.ts:86

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

Defined in: packages/blue-boot/src/application.ts:95

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

Defined in: packages/blue-boot/src/application.ts:104

Sets the property sources that will be added during environment preparation.

#### Parameters

##### properties

`JSONObject`

Property values to expose to the application environment.

#### Returns

`void`

***

### \_configureEnvironment()

> `protected` **\_configureEnvironment**(`environment`, `args`): `void`

Defined in: packages/blue-boot/src/application.ts:115

Applies environment-level configuration before the application context is created.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment being prepared.

##### args

`string`[]

Command-line arguments supplied to the application.

#### Returns

`void`

***

### \_configureProfiles()

> `protected` **\_configureProfiles**(`environment`, `args`): `void`

Defined in: packages/blue-boot/src/application.ts:127

Applies the configured active profiles to the environment.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment being prepared.

##### args

`string`[]

Command-line arguments supplied to the application.

#### Returns

`void`

***

### \_configurePropertySources()

> `protected` **\_configurePropertySources**(`environment`, `args`): `void`

Defined in: packages/blue-boot/src/application.ts:139

Adds configured property sources to the environment.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment being prepared.

##### args

`string`[]

Command-line arguments supplied to the application.

#### Returns

`void`

***

### \_prepareContext()

> `protected` **\_prepareContext**(`environment`, `args`): `ConfigurableApplicationContext`

Defined in: packages/blue-boot/src/application.ts:152

Creates and refreshes the application context.

#### Parameters

##### environment

`ConfigurableEnvironment`

The prepared environment.

##### args

`string`[]

Command-line arguments supplied to the application.

#### Returns

`ConfigurableApplicationContext`

The refreshed application context.

***

### \_prepareEnvironment()

> `protected` **\_prepareEnvironment**(`args`): `ConfigurableEnvironment`

Defined in: packages/blue-boot/src/application.ts:171

Prepares the environment used for application startup.

#### Parameters

##### args

`string`[]

Command-line arguments supplied to the application.

#### Returns

`ConfigurableEnvironment`

The prepared environment.

***

### close()

> **close**(): `void`

Defined in: packages/blue-boot/src/application.ts:190

Closes the application and releases resources.
Emits the `'closed'` event, then destroys the emitter.

#### Returns

`void`

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/lib/event-emitter.d.ts:40

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

`EventType`

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

`Emitter.emit`

***

### eventTypes()

> **eventTypes**(): `EventType`[]

Defined in: packages/blue-context/lib/event-emitter.d.ts:46

Returns the event types with registered listeners.

#### Returns

`EventType`[]

The registered event types.

#### Inherited from

`Emitter.eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/lib/event-emitter.d.ts:53

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

Defined in: packages/blue-context/lib/event-emitter.d.ts:60

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

### on()

> **on**(`type`, `listener`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:68

Adds a listener for an event type.

#### Parameters

##### type

`EventType`

The event type.

##### listener

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

`Emitter.on`

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:76

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

### clear()

> **clear**(`type?`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:198

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

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-context/lib/event-emitter.d.ts:204

Serializes the listener counts to JSON.

#### Returns

`JSONValue`

A JSON representation of the emitter state.

#### Inherited from

`Emitter.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-context/lib/event-emitter.d.ts:210

Returns a compact textual summary of the emitter.

#### Returns

`string`

A string representation.

#### Inherited from

`Emitter.toString`

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/lib/event-emitter.d.ts:214

Destroys the emitter and clears its listeners.

#### Returns

`void`

#### Inherited from

`Emitter.destroy`
