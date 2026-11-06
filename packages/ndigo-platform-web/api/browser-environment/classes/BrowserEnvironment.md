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

The explicitly active profiles.

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

#### Inherited from

`StandardEnvironment.defaultProfiles`

## Methods

### acceptsProfiles()

> **acceptsProfiles**(`expression`): `boolean`

Evaluates a profile expression against the effective active set
(explicit profiles, or defaults when none are explicit).

#### Parameters

##### expression

`string` \| [`ProfileTerm`](#)

The profile expression (`dev`, `!prod`, `a & b`,
  `(a | b) & c`) or a composed [ProfileTerm](#) (AD-34 D5).

#### Returns

`boolean`

`true` when the expression matches.

#### Throws

On malformed expressions.

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

`StandardEnvironment.getProperty`

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

`T` \| (new (...`args`) => `T`) \| (() => `T`)

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

Raw index lookup, bypassing placeholder resolution (internal use by the
placeholder resolver; consumers should use [getProperty](#getproperty)).

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue` \| `undefined`

The raw value or `undefined`.

#### Inherited from

`StandardEnvironment.getRawProperty`

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

`StandardEnvironment.getRequiredProperty`

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

`T` \| (new (...`args`) => `T`) \| (() => `T`)

The target constructor or primitive.

#### Returns

`T`

The typed value.

#### Throws

When missing, unresolved, or unconvertible.

#### Inherited from

`StandardEnvironment.getRequiredPropertyAs`

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

Merges property sources and profiles from another configurable environment.

#### Parameters

##### environment

`ConfigurableEnvironment`

#### Returns

`void`

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

`StandardEnvironment.originOf`

***

### refresh()

> **refresh**(): `void`

Recomputes the environment from its current sources: rebuilds the
lookup index and clears caches. Environment-scope only (AD-16 D3).

#### Returns

`void`

#### Inherited from

`StandardEnvironment.refresh`

***

### typedConfig()

> **typedConfig**\<`S`\>(`prefix`, `schema`): `output`\<`S`\> \| `undefined`

Resolves a schema-typed configuration value from this environment
(AD-34 D3): object-shaped schemas read each key under `prefix`
(`server.port` for `('server', z.object({ port: ... }))`); coercion,
defaults and required checks follow the schema. A missing required key
throws the zod error; an absent value with no default yields
`undefined`.

#### Type Parameters

##### S

`S` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Parameters

##### prefix

`string`

Property prefix (the keypath when the schema is a
  top-level scalar).

##### schema

`S`

The zod schema describing the value.

#### Returns

`output`\<`S`\> \| `undefined`

The parsed typed value, or `undefined` when absent.

#### Inherited from

`StandardEnvironment.typedConfig`
