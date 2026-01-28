[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurableEnvironment

# Interface: ConfigurableEnvironment

Defined in: packages/blue-context/src/environment.ts:30

## Extends

- [`Environment`](Environment.md)

## Properties

### activeProfiles

> **activeProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:16

#### Inherited from

[`Environment`](Environment.md).[`activeProfiles`](Environment.md#activeprofiles)

***

### defaultProfiles

> **defaultProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:17

#### Inherited from

[`Environment`](Environment.md).[`defaultProfiles`](Environment.md#defaultprofiles)

***

### propertySources

> **propertySources**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

Defined in: packages/blue-context/src/environment.ts:31

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/src/environment.ts:19

#### Parameters

##### profile

`string`

#### Returns

`void`

#### Inherited from

[`Environment`](Environment.md).[`addActiveProfile`](Environment.md#addactiveprofile)

***

### merge()

> **merge**(`environment`): `any`

Defined in: packages/blue-context/src/environment.ts:32

#### Parameters

##### environment

[`Environment`](Environment.md)

#### Returns

`any`

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/property-resolver.ts:10

#### Parameters

##### key

`string`

##### defaultValue?

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`Environment`](Environment.md).[`getProperty`](Environment.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/property-resolver.ts:11

#### Parameters

##### key

`string`

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`Environment`](Environment.md).[`getRequiredProperty`](Environment.md#getrequiredproperty)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/property-resolver.ts:12

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Inherited from

[`Environment`](Environment.md).[`hasProperty`](Environment.md#hasproperty)
