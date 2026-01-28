[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / Route

# Interface: Route

Defined in: packages/blue-router/src/route.ts:10

## Extends

- `ArrayLike`\<[`RouteSegment`](RouteSegment.md)\>.[`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Indexable

\[`n`: `number`\]: [`RouteSegment`](RouteSegment.md)

## Properties

### data

> **data**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-router/src/route.ts:13

***

### dataString?

> `optional` **dataString**: `string`

Defined in: packages/blue-router/src/route.ts:14

***

### id

> **id**: `number`

Defined in: packages/blue-router/src/route.ts:15

***

### path

> **path**: `string`

Defined in: packages/blue-router/src/route.ts:16

***

### raw

> **raw**: `string`

Defined in: packages/blue-router/src/route.ts:17

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

`string`

#### Inherited from

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:30

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)
