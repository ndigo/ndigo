[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [browser-environment](../README.md) / BrowserEnvironment

# Class: BrowserEnvironment

Browser-specific environment implementation for `@ndigo/platform-web`
applications.

Extends `StandardEnvironment` so that DI containers and bootstrap utilities
can discriminate between browser and Node environments by class identity
(e.g., `instanceof BrowserEnvironment`).

Registers `importMetaEnv` (Vite's `import.meta.env`, `VITE_`-prefixed keys
only) when Vite is present; the host app may register a `bootstrap` source
with server-injected JSON via `getPropertySources().addLast('bootstrap', data)`.

**Secret boundary (AD-13)**: anything in `importMetaEnv` or `bootstrap` is
client-visible by definition — secrets belong in server-only sources and
are never registered on browser environments.

## Extends

- `StandardEnvironment`

## Constructors

### Constructor

> **new BrowserEnvironment**(`propertySources?`, `options?`, `importMetaEnvPresent?`): `BrowserEnvironment`

Creates a browser environment.

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

Custom property sources (higher precedence than the built-ins).

##### options?

`ResolverOptions` = `{}`

Resolver options (index strategy).

##### importMetaEnvPresent?

`boolean`

Test seam: force import.meta.env presence
  detection (omit to auto-detect).

#### Returns

`BrowserEnvironment`

#### Overrides

`StandardEnvironment.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

String tag for this environment.

##### Returns

`string`

#### Inherited from

`StandardEnvironment.[toStringTag]`

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

#### Inherited from

`StandardEnvironment.activeProfiles`

***

### activeProfilesOrDefaults

#### Get Signature

> **get** **activeProfilesOrDefaults**(): `string`[]

The effective active set: explicit profiles when present, else the
defaults (reference parity — defaults gate only when nothing is explicit).

##### Returns

`string`[]

#### Inherited from

`StandardEnvironment.activeProfilesOrDefaults`

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

#### Inherited from

`StandardEnvironment.defaultProfiles`

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

`StandardEnvironment.acceptsProfiles`

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

`StandardEnvironment.addActiveProfile`

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

`StandardEnvironment.addDefaultProfile`

***

### applySecretDecryptor()

> **applySecretDecryptor**(`decryptor`): `void`

Applies at-rest secret decryption to this environment (AD-29 Wave 2).

Rebuilds the resolver with the decryptor threaded through its options
(replace-not-mutate, AD-11 D1): existing sources and registry bindings
are preserved. Applying twice is idempotent — the last decryptor wins.

#### Parameters

##### decryptor

`SecretDecryptor`

The secret decryptor (e.g. a `SecretSchemeRegistry`).

#### Returns

`void`

#### Inherited from

`StandardEnvironment.applySecretDecryptor`

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

`StandardEnvironment.emit`

***

### eventTypes()

> **eventTypes**(): `EventType`[]

Returns the event types with registered listeners.

#### Returns

`EventType`[]

The registered event types.

#### Inherited from

`StandardEnvironment.eventTypes`

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

`StandardEnvironment.getProperty`

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

`StandardEnvironment.getPropertyAs`

***

### getPropertySources()

> **getPropertySources**(): `MutablePropertySources`

The ordered, named property source registry (Phase 0).

Mutations (add/replace/remove) are picked up lazily on the next lookup,
so burst edits cost a single rebuild.

#### Returns

`MutablePropertySources`

The live registry.

#### Inherited from

`StandardEnvironment.getPropertySources`

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

`StandardEnvironment.getRawProperty`

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

`StandardEnvironment.getRequiredProperty`

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

`StandardEnvironment.getRequiredPropertyAs`

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

`StandardEnvironment.hasProperty`

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

`StandardEnvironment.listenerCount`

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

`StandardEnvironment.listeners`

***

### merge()

> **merge**(`environment`): `void`

Merges another environment's property sources, preserving precedence.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to merge.

#### Returns

`void`

Nothing; sources are appended.

#### Inherited from

`StandardEnvironment.merge`

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

`StandardEnvironment.off`

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

`StandardEnvironment.on`

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

`StandardEnvironment.originOf`

***

### refresh()

> **refresh**(): `void`

Rebuilds the resolver and emits the refresh event.

#### Returns

`void`

Nothing; listeners are notified as a side effect.

#### Inherited from

`StandardEnvironment.refresh`

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

`StandardEnvironment.typedConfig`
