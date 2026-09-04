[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurableEnvironment

# Interface: ConfigurableEnvironment

Defined in: packages/blue-context/src/environment.ts:62

Environment variant that allows property source replacement and merging.

## Extends

- [`Environment`](Environment.md)

## Properties

### activeProfiles

> **activeProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:22

The explicitly active profiles.

#### Inherited from

[`Environment`](Environment.md).[`activeProfiles`](Environment.md#activeprofiles)

***

### defaultProfiles

> **defaultProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:26

The default profiles used when no active profile is configured.

#### Inherited from

[`Environment`](Environment.md).[`defaultProfiles`](Environment.md#defaultprofiles)

***

### propertySources

> **propertySources**: `JSONObject`[]

Defined in: packages/blue-context/src/environment.ts:66

The ordered property sources used for resolution.

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

#### Inherited from

[`Environment`](Environment.md).[`addActiveProfile`](Environment.md#addactiveprofile)

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

#### Inherited from

[`Environment`](Environment.md).[`addDefaultProfile`](Environment.md#adddefaultprofile)

***

### merge()

> **merge**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:72

Merges another environment into this one.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to merge.

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

[`Environment`](Environment.md).[`getProperty`](Environment.md#getproperty)

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

[`Environment`](Environment.md).[`getRequiredProperty`](Environment.md#getrequiredproperty)

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

[`Environment`](Environment.md).[`hasProperty`](Environment.md#hasproperty)
