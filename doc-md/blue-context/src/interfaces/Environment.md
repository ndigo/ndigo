[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / Environment

# Interface: Environment

Defined in: packages/blue-context/src/environment.ts:15

## Extends

- [`PropertyResolver`](PropertyResolver.md)

## Extended by

- [`ConfigurableEnvironment`](ConfigurableEnvironment.md)

## Properties

### activeProfiles

> **activeProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:16

***

### defaultProfiles

> **defaultProfiles**: `string`[]

Defined in: packages/blue-context/src/environment.ts:17

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/src/environment.ts:19

#### Parameters

##### profile

`string`

#### Returns

`void`

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

[`PropertyResolver`](PropertyResolver.md).[`getProperty`](PropertyResolver.md#getproperty)

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

[`PropertyResolver`](PropertyResolver.md).[`getRequiredProperty`](PropertyResolver.md#getrequiredproperty)

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

[`PropertyResolver`](PropertyResolver.md).[`hasProperty`](PropertyResolver.md#hasproperty)
