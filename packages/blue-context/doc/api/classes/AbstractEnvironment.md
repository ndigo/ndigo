[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / AbstractEnvironment

# Abstract Class: AbstractEnvironment

Base implementation for environments with profile and property-source support.

Environments are [EventEmitter](../interfaces/EventEmitter.md) instances: `refresh()` emits
[CONFIG\_REFRESH\_EVENT](../variables/CONFIG_REFRESH_EVENT.md) after recomputing from current sources, so
listeners (e.g. boot's `@refreshScope` rebinder, AD-29) observe config
changes.

## Extends

- [`EventEmitter`](../interfaces/EventEmitter.md)\<`this`\> & `Null`\<`this`\>

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

[`ResolverOptions`](../interfaces/ResolverOptions.md) = `{}`

#### Returns

`AbstractEnvironment`

#### Overrides

`AsEventEmitter(Null).constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

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

The explicitly active profiles.

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
defaults (Spring parity — defaults gate only when nothing is explicit).

##### Returns

`string`[]

***

### defaultProfiles

#### Get Signature

> **get** **defaultProfiles**(): `string`[]

The default profiles used when no active profile is configured.

##### Returns

`string`[]

#### Set Signature

> **set** **defaultProfiles**(`profiles`): `void`

The default profiles used when no active profile is configured.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

The default profiles used when no active profile is configured.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`defaultProfiles`](../interfaces/ConfigurableEnvironment.md#defaultprofiles)

***

### propertySources

#### Get Signature

> **get** **propertySources**(): `JSONObject`[]

Compatibility alias (deprecated): the captured property sources.
Mutating the returned array is a no-op; use the registry instead.

##### Returns

`JSONObject`[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Compatibility alias (deprecated): the captured property sources.
Mutating the returned array is a no-op; use the registry instead.

##### Parameters

###### propertySources

`JSONObject`[]

##### Returns

`void`

Compatibility alias (deprecated): the captured property sources.
Mutating the returned array is a no-op; use the registry instead.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`propertySources`](../interfaces/ConfigurableEnvironment.md#propertysources)

## Methods

### acceptsProfiles()

> **acceptsProfiles**(`expression`): `boolean`

Evaluates a profile expression against the effective active set
(explicit profiles, or defaults when none are explicit).

#### Parameters

##### expression

`string`

The profile expression (`dev`, `!prod`, `a & b`, `(a | b) & c`).

#### Returns

`boolean`

`true` when the expression matches.

#### Throws

On malformed expressions.

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

[`SecretDecryptor`](../interfaces/SecretDecryptor.md)

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

[`EventType`](../type-aliases/EventType.md)

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

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`eventTypes`](../interfaces/ConfigurableEnvironment.md#eventtypes)

#### Inherited from

`AsEventEmitter(Null).eventTypes`

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Resolves a property value, falling back to a default when missing.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when no property is found.

#### Returns

`JSONValue` \| `undefined`

The resolved property value or the default value.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getProperty`](../interfaces/ConfigurableEnvironment.md#getproperty)

***

### getPropertyAs()

> **getPropertyAs**\<`T`\>(`key`, `targetType`, `defaultValue?`): `T` \| `undefined`

Resolves a property as a typed value, converting when needed.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property name to resolve.

##### targetType

`T` \| ((...`args`) => `T`) \| (() => `T`)

The target constructor or primitive (`Number`, `Boolean`, `Date`, ...).

##### defaultValue?

`T`

The value to return when the property is missing.

#### Returns

`T` \| `undefined`

The typed value or the default.

#### Throws

When a present value cannot be converted.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getPropertyAs`](../interfaces/ConfigurableEnvironment.md#getpropertyas)

***

### getPropertySources()

> **getPropertySources**(): [`MutablePropertySources`](MutablePropertySources.md)

The ordered, named property source registry (Phase 0).

Mutations (add/replace/remove) are picked up lazily on the next lookup,
so burst edits cost a single rebuild.

#### Returns

[`MutablePropertySources`](MutablePropertySources.md)

The live registry.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getPropertySources`](../interfaces/ConfigurableEnvironment.md#getpropertysources)

***

### getRawProperty()

> **getRawProperty**(`key`): `JSONValue` \| `undefined`

Raw index lookup, bypassing placeholder resolution (internal use by the
placeholder resolver; consumers should use [getProperty](../interfaces/PropertyResolver.md#getproperty)).

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue` \| `undefined`

The raw value or `undefined`.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRawProperty`](../interfaces/ConfigurableEnvironment.md#getrawproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Returns the resolved property value or throws when missing.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue`

The resolved property value.

#### Throws

When the property cannot be resolved.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRequiredProperty`](../interfaces/ConfigurableEnvironment.md#getrequiredproperty)

***

### getRequiredPropertyAs()

> **getRequiredPropertyAs**\<`T`\>(`key`, `targetType`): `T`

Returns a typed property or throws when missing or unconvertible.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property name to resolve.

##### targetType

`T` \| ((...`args`) => `T`) \| (() => `T`)

The target constructor or primitive.

#### Returns

`T`

The typed value.

#### Throws

When missing, unresolved, or unconvertible.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRequiredPropertyAs`](../interfaces/ConfigurableEnvironment.md#getrequiredpropertyas)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Returns whether a property key can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`hasProperty`](../interfaces/ConfigurableEnvironment.md#hasproperty)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

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

[`EventType`](../type-aliases/EventType.md)

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

Merges another environment into this one.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

The environment to merge.

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`merge`](../interfaces/ConfigurableEnvironment.md#merge)

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

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

[`EventType`](../type-aliases/EventType.md) \| [`EventHandlers`](../type-aliases/EventHandlers.md)

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

Returns the name of the source that won the given property key, or
`null` when unknown or the active index retains no origins.

#### Parameters

##### key

`string`

The property key (top-level granularity).

#### Returns

`string` \| `null`

The winning source name, or `null`.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`originOf`](../interfaces/ConfigurableEnvironment.md#originof)

***

### refresh()

> **refresh**(): `void`

Recomputes the environment from its current sources: rebuilds the
lookup index and clears caches. Environment-scope only (AD-16 D3).

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`refresh`](../interfaces/ConfigurableEnvironment.md#refresh)
