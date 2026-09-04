[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / Environment

# Interface: Environment

Defined in: packages/blue-context/src/environment.ts:18

Resolves properties and manages profile activation for an application environment.

## Extends

- [`PropertyResolver`](PropertyResolver.md)

## Extended by

- [`ConfigurableEnvironment`](ConfigurableEnvironment.md)

## Properties

### activeProfiles

> **activeProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:22

The explicitly active profiles.

***

### defaultProfiles

> **defaultProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:26

The default profiles used when no active profile is configured.

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/src/environment.ts:33

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

Defined in: packages/blue-context/src/environment.ts:39

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

Defined in: packages/blue-context/src/property-resolver.ts:20

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

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Defined in: packages/blue-context/src/property-resolver.ts:28

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

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/property-resolver.ts:35

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
