[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / PrototypalPropertyResolver

# Class: PrototypalPropertyResolver

Defined in: packages/blue-context/src/property-resolver.ts:76

## Implements

- [`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md)

## Constructors

### Constructor

> **new PrototypalPropertyResolver**(`propertySources`): `PrototypalPropertyResolver`

Defined in: packages/blue-context/src/property-resolver.ts:96

#### Parameters

##### propertySources

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

#### Returns

`PrototypalPropertyResolver`

## Properties

### properties

> `readonly` **properties**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-context/src/property-resolver.ts:78

## Accessors

### propertySources

#### Get Signature

> **get** **propertySources**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

Defined in: packages/blue-context/src/property-resolver.ts:82

##### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Defined in: packages/blue-context/src/property-resolver.ts:86

##### Parameters

###### propertySources

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

##### Returns

`void`

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`propertySources`](../interfaces/ConfigurablePropertyResolver.md#propertysources)

## Methods

### getProperty()

> **getProperty**(`key`, `defaultValue?`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/property-resolver.ts:108

#### Parameters

##### key

`string`

##### defaultValue?

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getProperty`](../interfaces/ConfigurablePropertyResolver.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/property-resolver.ts:122

#### Parameters

##### key

`string`

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getRequiredProperty`](../interfaces/ConfigurablePropertyResolver.md#getrequiredproperty)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/property-resolver.ts:134

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`hasProperty`](../interfaces/ConfigurablePropertyResolver.md#hasproperty)
