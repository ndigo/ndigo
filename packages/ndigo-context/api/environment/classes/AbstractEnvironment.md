[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [environment](../README.md) / AbstractEnvironment

# Abstract Class: AbstractEnvironment

Base implementation for environments with profile and property-source support.

Environments are [EventEmitter](../../event-emitter/interfaces/EventEmitter.md) instances: `refresh()` emits
[CONFIG\_REFRESH\_EVENT](../variables/CONFIG_REFRESH_EVENT.md) after recomputing from current sources, so
listeners (e.g. boot's `@refreshScope` rebinder, AD-29) observe config
changes.

## Example

```ts
const env = new StandardEnvironment([new MapPropertySource('app', { 'server.port': '8080' })]);
env.getProperty('server.port'); // '8080'
env.acceptsProfiles('dev'); // false
```

## Extends

- [`EventEmitter`](../../event-emitter/interfaces/EventEmitter.md)\<`this`\> & `Null`\<`this`\>

## Extended by

- [`MockEnvironment`](MockEnvironment.md)
- [`StandardEnvironment`](StandardEnvironment.md)

## Implements

- [`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

## Constructors

### Constructor

> **new AbstractEnvironment**(`propertySources?`, `options?`): `AbstractEnvironment`

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

##### options?

[`ResolverOptions`](../../property-resolver/interfaces/ResolverOptions.md) = `{}`

#### Returns

`AbstractEnvironment`

#### Overrides

`AsEventEmitter(Null).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

String tag for this environment.

##### Returns

`string`

***

### activeProfiles

#### Get Signature

> **get** **activeProfiles**(): `string`[]

The explicitly active profiles.

##### Returns

`string`[]

#### Set Signature

> **set** **activeProfiles**(`profiles`): `void`

Sets the active profiles.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

The explicitly active profiles.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`activeProfiles`](../interfaces/ConfigurableEnvironment.md#activeprofiles)

***

### activeProfilesOrDefaults

#### Get Signature

> **get** **activeProfilesOrDefaults**(): `string`[]

The effective active set: explicit profiles when present, else the
defaults (reference parity — defaults gate only when nothing is explicit).

##### Returns

`string`[]

***

### defaultProfiles

#### Get Signature

> **get** **defaultProfiles**(): `string`[]

The default profiles.

##### Returns

`string`[]

#### Set Signature

> **set** **defaultProfiles**(`profiles`): `void`

Sets the default profiles.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

The default profiles used when no active profile is configured.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`defaultProfiles`](../interfaces/ConfigurableEnvironment.md#defaultprofiles)

## Methods

### acceptsProfiles()

> **acceptsProfiles**(`expression`): `boolean`

Evaluates a profile expression against the active/default set.

#### Parameters

##### expression

`string` \| [`ProfileTerm`](#)

The profile expression.

#### Returns

`boolean`

Whether the expression matches.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`acceptsProfiles`](../interfaces/ConfigurableEnvironment.md#acceptsprofiles)

***

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Adds a profile to the active set.

#### Parameters

##### profile

`string`

The profile name.

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`addActiveProfile`](../interfaces/ConfigurableEnvironment.md#addactiveprofile)

***

### addDefaultProfile()

> **addDefaultProfile**(`profile`): `void`

Adds a profile to the default set.

#### Parameters

##### profile

`string`

The profile name.

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`addDefaultProfile`](../interfaces/ConfigurableEnvironment.md#adddefaultprofile)

***

### applySecretDecryptor()

> **applySecretDecryptor**(`decryptor`): `void`

Applies at-rest secret decryption to this environment (AD-29 Wave 2).

Rebuilds the resolver with the decryptor threaded through its options
(replace-not-mutate, AD-11 D1): existing sources and registry bindings
are preserved. Applying twice is idempotent — the last decryptor wins.

#### Parameters

##### decryptor

[`SecretDecryptor`](../../secret-cipher/interfaces/SecretDecryptor.md)

The secret decryptor (e.g. a `SecretSchemeRegistry`).

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`applySecretDecryptor`](../interfaces/ConfigurableEnvironment.md#applysecretdecryptor)

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`emit`](../interfaces/ConfigurableEnvironment.md#emit)

#### Inherited from

`AsEventEmitter(Null).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../../event-emitter/type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../../event-emitter/type-aliases/EventType.md)[]

The registered event types.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`eventTypes`](../interfaces/ConfigurableEnvironment.md#eventtypes)

#### Inherited from

`AsEventEmitter(Null).eventTypes`

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Resolves a property value.

#### Parameters

##### key

`string`

The property key.

##### defaultValue?

`JSONValue`

Value returned when the key is absent.

#### Returns

`JSONValue` \| `undefined`

The resolved value, or `defaultValue`.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getProperty`](../interfaces/ConfigurableEnvironment.md#getproperty)

***

### getPropertyAs()

> **getPropertyAs**\<`T`\>(`key`, `targetType`, `defaultValue?`): `T` \| `undefined`

Resolves and converts a property value.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property key.

##### targetType

`T` \| (new (...`args`) => `T`) \| (() => `T`)

The conversion target type.

##### defaultValue?

`T`

Value returned when the key is absent.

#### Returns

`T` \| `undefined`

The converted value, or `defaultValue`.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getPropertyAs`](../interfaces/ConfigurableEnvironment.md#getpropertyas)

***

### getPropertySources()

> **getPropertySources**(): [`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

The ordered, named property source registry (Phase 0).

Mutations (add/replace/remove) are picked up lazily on the next lookup,
so burst edits cost a single rebuild.

#### Returns

[`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

The live registry.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getPropertySources`](../interfaces/ConfigurableEnvironment.md#getpropertysources)

***

### getRawProperty()

> **getRawProperty**(`key`): `JSONValue` \| `undefined`

Resolves the raw stored value of a property.

#### Parameters

##### key

`string`

The property key.

#### Returns

`JSONValue` \| `undefined`

The raw value, or `undefined`.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRawProperty`](../interfaces/ConfigurableEnvironment.md#getrawproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Resolves a property, throwing when absent.

#### Parameters

##### key

`string`

The property key.

#### Returns

`JSONValue`

The resolved value.

#### Throws

When the key has no value.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRequiredProperty`](../interfaces/ConfigurableEnvironment.md#getrequiredproperty)

***

### getRequiredPropertyAs()

> **getRequiredPropertyAs**\<`T`\>(`key`, `targetType`): `T`

Resolves and converts a property, throwing when absent.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property key.

##### targetType

`T` \| (new (...`args`) => `T`) \| (() => `T`)

The conversion target type.

#### Returns

`T`

The converted value.

#### Throws

When the key has no value or conversion fails.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRequiredPropertyAs`](../interfaces/ConfigurableEnvironment.md#getrequiredpropertyas)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Whether the environment resolves `key`.

#### Parameters

##### key

`string`

The property key.

#### Returns

`boolean`

Whether a value exists.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`hasProperty`](../interfaces/ConfigurableEnvironment.md#hasproperty)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

#### Returns

`number`

The listener count.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`listenerCount`](../interfaces/ConfigurableEnvironment.md#listenercount)

#### Inherited from

`AsEventEmitter(Null).listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Returns a snapshot of listeners for a type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`listeners`](../interfaces/ConfigurableEnvironment.md#listeners)

#### Inherited from

`AsEventEmitter(Null).listeners`

***

### merge()

> **merge**(`environment`): `void`

Merges another environment's property sources, preserving precedence.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

The environment to merge.

#### Returns

`void`

Nothing; sources are appended.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`merge`](../interfaces/ConfigurableEnvironment.md#merge)

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`off`](../interfaces/ConfigurableEnvironment.md#off)

#### Inherited from

`AsEventEmitter(Null).off`

***

### on()

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

#### Parameters

##### type

[`EventType`](../../event-emitter/type-aliases/EventType.md) \| [`EventHandlers`](../../event-emitter/type-aliases/EventHandlers.md)

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`on`](../interfaces/ConfigurableEnvironment.md#on)

#### Inherited from

`AsEventEmitter(Null).on`

***

### originOf()

> **originOf**(`key`): `string` \| `null`

Returns the source name that last set `key`.

#### Parameters

##### key

`string`

The property key.

#### Returns

`string` \| `null`

The origin source name, or `null`.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`originOf`](../interfaces/ConfigurableEnvironment.md#originof)

***

### refresh()

> **refresh**(): `void`

Rebuilds the resolver and emits the refresh event.

#### Returns

`void`

Nothing; listeners are notified as a side effect.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`refresh`](../interfaces/ConfigurableEnvironment.md#refresh)

***

### typedConfig()

> **typedConfig**\<`S`\>(`prefix`, `schema`): `output`\<`S`\> \| `undefined`

Resolves a Zod-schema configuration subtree.

#### Type Parameters

##### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Parameters

##### prefix

`string`

The property prefix.

##### schema

`S`

The Zod schema to validate against.

#### Returns

`output`\<`S`\> \| `undefined`

The validated configuration, or `undefined` when absent.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`typedConfig`](../interfaces/ConfigurableEnvironment.md#typedconfig)
