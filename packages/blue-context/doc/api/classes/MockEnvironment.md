[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / MockEnvironment

# Class: MockEnvironment

Environment implementation intended for tests.

## Extends

- [`AbstractEnvironment`](AbstractEnvironment.md)

## Constructors

### Constructor

> **new MockEnvironment**(`propertySources?`, `options?`): `MockEnvironment`

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

##### options?

[`ResolverOptions`](../interfaces/ResolverOptions.md) = `{}`

#### Returns

`MockEnvironment`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`constructor`](AbstractEnvironment.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`[toStringTag]`](AbstractEnvironment.md#tostringtag)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`activeProfiles`](AbstractEnvironment.md#activeprofiles)

***

### activeProfilesOrDefaults

#### Get Signature

> **get** **activeProfilesOrDefaults**(): `string`[]

The effective active set: explicit profiles when present, else the
defaults (Spring parity — defaults gate only when nothing is explicit).

##### Returns

`string`[]

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`activeProfilesOrDefaults`](AbstractEnvironment.md#activeprofilesordefaults)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`defaultProfiles`](AbstractEnvironment.md#defaultprofiles)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`propertySources`](AbstractEnvironment.md#propertysources)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`acceptsProfiles`](AbstractEnvironment.md#acceptsprofiles)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`addActiveProfile`](AbstractEnvironment.md#addactiveprofile)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`addDefaultProfile`](AbstractEnvironment.md#adddefaultprofile)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`applySecretDecryptor`](AbstractEnvironment.md#applysecretdecryptor)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`emit`](AbstractEnvironment.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`eventTypes`](AbstractEnvironment.md#eventtypes)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`getProperty`](AbstractEnvironment.md#getproperty)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`getPropertyAs`](AbstractEnvironment.md#getpropertyas)

***

### getPropertySources()

> **getPropertySources**(): [`MutablePropertySources`](MutablePropertySources.md)

The ordered, named property source registry (Phase 0).

Mutations (add/replace/remove) are picked up lazily on the next lookup,
so burst edits cost a single rebuild.

#### Returns

[`MutablePropertySources`](MutablePropertySources.md)

The live registry.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getPropertySources`](AbstractEnvironment.md#getpropertysources)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRawProperty`](AbstractEnvironment.md#getrawproperty)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRequiredProperty`](AbstractEnvironment.md#getrequiredproperty)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRequiredPropertyAs`](AbstractEnvironment.md#getrequiredpropertyas)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`hasProperty`](AbstractEnvironment.md#hasproperty)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`listenerCount`](AbstractEnvironment.md#listenercount)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`listeners`](AbstractEnvironment.md#listeners)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`merge`](AbstractEnvironment.md#merge)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`off`](AbstractEnvironment.md#off)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`on`](AbstractEnvironment.md#on)

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

[`AbstractEnvironment`](AbstractEnvironment.md).[`originOf`](AbstractEnvironment.md#originof)

***

### refresh()

> **refresh**(): `void`

Recomputes the environment from its current sources: rebuilds the
lookup index and clears caches. Environment-scope only (AD-16 D3).

#### Returns

`void`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`refresh`](AbstractEnvironment.md#refresh)
