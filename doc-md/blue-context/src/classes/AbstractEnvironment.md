[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / AbstractEnvironment

# Abstract Class: AbstractEnvironment

Defined in: packages/blue-context/src/environment.ts:115

Base implementation for environments with profile and property-source support.

## Extended by

- [`MockEnvironment`](MockEnvironment.md)
- [`StandardEnvironment`](StandardEnvironment.md)

## Implements

- [`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

## Constructors

### Constructor

> **new AbstractEnvironment**(`propertySources?`): `AbstractEnvironment`

Defined in: packages/blue-context/src/environment.ts:152

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

#### Returns

`AbstractEnvironment`

## Accessors

### propertySources

#### Get Signature

> **get** **propertySources**(): `JSONObject`[]

Defined in: packages/blue-context/src/environment.ts:120

The ordered property sources used for resolution.

##### Returns

`JSONObject`[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Defined in: packages/blue-context/src/environment.ts:124

The ordered property sources used for resolution.

##### Parameters

###### propertySources

`JSONObject`[]

##### Returns

`void`

The ordered property sources used for resolution.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`propertySources`](../interfaces/ConfigurableEnvironment.md#propertysources)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-context/src/environment.ts:128

##### Returns

`string`

***

### activeProfiles

#### Get Signature

> **get** **activeProfiles**(): `string`[]

Defined in: packages/blue-context/src/environment.ts:132

The explicitly active profiles.

##### Returns

`string`[]

#### Set Signature

> **set** **activeProfiles**(`profiles`): `void`

Defined in: packages/blue-context/src/environment.ts:136

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

### defaultProfiles

#### Get Signature

> **get** **defaultProfiles**(): `string`[]

Defined in: packages/blue-context/src/environment.ts:142

The default profiles used when no active profile is configured.

##### Returns

`string`[]

#### Set Signature

> **set** **defaultProfiles**(`profiles`): `void`

Defined in: packages/blue-context/src/environment.ts:146

The default profiles used when no active profile is configured.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

The default profiles used when no active profile is configured.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`defaultProfiles`](../interfaces/ConfigurableEnvironment.md#defaultprofiles)

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/src/environment.ts:158

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

Defined in: packages/blue-context/src/environment.ts:162

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

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/environment.ts:166

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

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue`

Defined in: packages/blue-context/src/environment.ts:170

Resolves a property value, falling back to a default when missing.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when no property is found.

#### Returns

`JSONValue`

The resolved property value or the default value.

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getProperty`](../interfaces/ConfigurableEnvironment.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Defined in: packages/blue-context/src/environment.ts:174

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

### merge()

> **merge**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:178

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

### \_isActiveProfile()

> `protected` **\_isActiveProfile**(`profile`): `boolean`

Defined in: packages/blue-context/src/environment.ts:189

#### Parameters

##### profile

`string`

#### Returns

`boolean`
