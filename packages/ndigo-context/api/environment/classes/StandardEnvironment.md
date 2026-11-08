[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [environment](../README.md) / StandardEnvironment

# Class: StandardEnvironment

Default environment implementation used by application contexts.

## Extends

- [`AbstractEnvironment`](AbstractEnvironment.md)

## Constructors

### Constructor

> **new StandardEnvironment**(`propertySources?`, `options?`): `StandardEnvironment`

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

##### options?

[`ResolverOptions`](../../property-resolver/interfaces/ResolverOptions.md) = `{}`

#### Returns

`StandardEnvironment`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`constructor`](AbstractEnvironment.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

String tag for this environment.

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

Sets the active profiles.

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
defaults (reference parity — defaults gate only when nothing is explicit).

##### Returns

`string`[]

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`activeProfilesOrDefaults`](AbstractEnvironment.md#activeprofilesordefaults)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`defaultProfiles`](AbstractEnvironment.md#defaultprofiles)

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

[`SecretDecryptor`](../../secret-cipher/interfaces/SecretDecryptor.md)

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

[`EventType`](../../event-emitter/type-aliases/EventType.md)

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

> **eventTypes**(): [`EventType`](../../event-emitter/type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../../event-emitter/type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`eventTypes`](AbstractEnvironment.md#eventtypes)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getProperty`](AbstractEnvironment.md#getproperty)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getPropertyAs`](AbstractEnvironment.md#getpropertyas)

***

### getPropertySources()

> **getPropertySources**(): [`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

The ordered, named property source registry (Phase 0).

Mutations (add/replace/remove) are picked up lazily on the next lookup,
so burst edits cost a single rebuild.

#### Returns

[`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

The live registry.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getPropertySources`](AbstractEnvironment.md#getpropertysources)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRawProperty`](AbstractEnvironment.md#getrawproperty)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRequiredProperty`](AbstractEnvironment.md#getrequiredproperty)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRequiredPropertyAs`](AbstractEnvironment.md#getrequiredpropertyas)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`hasProperty`](AbstractEnvironment.md#hasproperty)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`listenerCount`](AbstractEnvironment.md#listenercount)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`listeners`](AbstractEnvironment.md#listeners)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`merge`](AbstractEnvironment.md#merge)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`off`](AbstractEnvironment.md#off)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`on`](AbstractEnvironment.md#on)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`originOf`](AbstractEnvironment.md#originof)

***

### refresh()

> **refresh**(): `void`

Rebuilds the resolver and emits the refresh event.

#### Returns

`void`

Nothing; listeners are notified as a side effect.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`refresh`](AbstractEnvironment.md#refresh)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`typedConfig`](AbstractEnvironment.md#typedconfig)
