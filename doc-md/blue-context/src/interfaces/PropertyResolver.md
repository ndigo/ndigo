[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / PropertyResolver

# Interface: PropertyResolver

Defined in: packages/blue-context/src/property-resolver.ts:9

## Extended by

- [`Environment`](Environment.md)
- [`ConfigurablePropertyResolver`](ConfigurablePropertyResolver.md)

## Methods

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

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/property-resolver.ts:11

#### Parameters

##### key

`string`

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/property-resolver.ts:12

#### Parameters

##### key

`string`

#### Returns

`boolean`
