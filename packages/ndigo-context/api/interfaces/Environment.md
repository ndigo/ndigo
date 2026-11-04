[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / Environment

# Interface: Environment

Resolves properties and manages profile activation for an application environment.

## Extends

- [`PropertyResolver`](PropertyResolver.md)

## Extended by

- [`ConfigurableEnvironment`](ConfigurableEnvironment.md)

## Properties

### activeProfiles

> **activeProfiles**: `string`[]

The explicitly active profiles.

***

### defaultProfiles

> **defaultProfiles**: `string`[]

The default profiles used when no active profile is configured.

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

[`PropertyResolver`](PropertyResolver.md).[`getProperty`](PropertyResolver.md#getproperty)

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

[`PropertyResolver`](PropertyResolver.md).[`getPropertyAs`](PropertyResolver.md#getpropertyas)

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

[`PropertyResolver`](PropertyResolver.md).[`getRawProperty`](PropertyResolver.md#getrawproperty)

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

[`PropertyResolver`](PropertyResolver.md).[`getRequiredProperty`](PropertyResolver.md#getrequiredproperty)

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

[`PropertyResolver`](PropertyResolver.md).[`getRequiredPropertyAs`](PropertyResolver.md#getrequiredpropertyas)

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

[`PropertyResolver`](PropertyResolver.md).[`hasProperty`](PropertyResolver.md#hasproperty)

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

#### Overrides

[`PropertyResolver`](PropertyResolver.md).[`originOf`](PropertyResolver.md#originof)

***

### refresh()

> **refresh**(): `void`

Recomputes the environment from its current sources: rebuilds the
lookup index and clears caches. Environment-scope only (AD-16 D3).

#### Returns

`void`

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
