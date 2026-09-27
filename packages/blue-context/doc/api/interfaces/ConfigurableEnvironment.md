[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ConfigurableEnvironment

# Interface: ConfigurableEnvironment

Environment variant that allows property source replacement and merging.
Configurable environments are also [EventEmitter](EventEmitter.md) instances:
`refresh()` emits `config:refresh` (AD-29 D-1).

## Extends

- [`Environment`](Environment.md).[`EventEmitter`](EventEmitter.md)

## Properties

### activeProfiles

> **activeProfiles**: `string`[]

The explicitly active profiles.

#### Inherited from

[`Environment`](Environment.md).[`activeProfiles`](Environment.md#activeprofiles)

***

### defaultProfiles

> **defaultProfiles**: `string`[]

The default profiles used when no active profile is configured.

#### Inherited from

[`Environment`](Environment.md).[`defaultProfiles`](Environment.md#defaultprofiles)

***

### propertySources

> **propertySources**: `JSONObject`[]

Compatibility alias (deprecated): the captured property sources.
Mutating the returned array is a no-op; use the registry instead.

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

#### Inherited from

[`Environment`](Environment.md).[`acceptsProfiles`](Environment.md#acceptsprofiles)

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

#### Inherited from

[`Environment`](Environment.md).[`addActiveProfile`](Environment.md#addactiveprofile)

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

#### Inherited from

[`Environment`](Environment.md).[`addDefaultProfile`](Environment.md#adddefaultprofile)

***

### applySecretDecryptor()

> **applySecretDecryptor**(`decryptor`): `void`

Applies at-rest secret decryption (AD-29 Wave 2): `{cipher:...}`
markers resolve to plaintext via the given decryptor on every lookup.
Replaces the resolver's options (replace-not-mutate) — idempotent.

#### Parameters

##### decryptor

[`SecretDecryptor`](SecretDecryptor.md)

The secret decryptor (e.g. a `SecretSchemeRegistry`).

#### Returns

`void`

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

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`emit`](EventEmitter.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`eventTypes`](EventEmitter.md#eventtypes)

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

#### Inherited from

[`Environment`](Environment.md).[`getProperty`](Environment.md#getproperty)

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

#### Inherited from

[`Environment`](Environment.md).[`getPropertyAs`](Environment.md#getpropertyas)

***

### getPropertySources()

> **getPropertySources**(): [`MutablePropertySources`](../classes/MutablePropertySources.md)

The ordered, named property source registry.

#### Returns

[`MutablePropertySources`](../classes/MutablePropertySources.md)

***

### getRawProperty()

> **getRawProperty**(`key`): `JSONValue` \| `undefined`

Raw index lookup, bypassing placeholder resolution (internal use by the
placeholder resolver; consumers should use [getProperty](PropertyResolver.md#getproperty)).

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue` \| `undefined`

The raw value or `undefined`.

#### Inherited from

[`Environment`](Environment.md).[`getRawProperty`](Environment.md#getrawproperty)

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

#### Inherited from

[`Environment`](Environment.md).[`getRequiredProperty`](Environment.md#getrequiredproperty)

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

#### Inherited from

[`Environment`](Environment.md).[`getRequiredPropertyAs`](Environment.md#getrequiredpropertyas)

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

#### Inherited from

[`Environment`](Environment.md).[`hasProperty`](Environment.md#hasproperty)

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

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`listenerCount`](EventEmitter.md#listenercount)

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

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`listeners`](EventEmitter.md#listeners)

***

### merge()

> **merge**(`environment`): `void`

Merges another environment into this one.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to merge.

#### Returns

`void`

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

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`off`](EventEmitter.md#off)

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

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`on`](EventEmitter.md#on)

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

#### Inherited from

[`Environment`](Environment.md).[`originOf`](Environment.md#originof)

***

### refresh()

> **refresh**(): `void`

Recomputes the environment from its current sources: rebuilds the
lookup index and clears caches. Environment-scope only (AD-16 D3).

#### Returns

`void`

#### Inherited from

[`Environment`](Environment.md).[`refresh`](Environment.md#refresh)
