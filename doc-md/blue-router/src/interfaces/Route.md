[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / Route

# Interface: Route\<TParams\>

Defined in: packages/blue-router/src/route.ts:21

Represents a complete route, composed of multiple segments, along with its parameters, path, and associated data.
It extends `ArrayLike<RouteSegment>` to allow iteration over its segments.

## Since

1.0.0

## Extends

- `ArrayLike`\<[`RouteSegment`](RouteSegment.md)\>.`Serializable`

## Type Parameters

### TParams

`TParams` *extends* `Record`\<`string`, `string`\> = `Record`\<`string`, `string`\>

A type representing the route parameters, defaulting to `Record<string, string>`.

## Indexable

> \[`n`: `number`\]: [`RouteSegment`](RouteSegment.md)

## Properties

### data

> **data**: `JSONObject`

Defined in: packages/blue-router/src/route.ts:26

***

### dataString?

> `optional` **dataString?**: `string`

Defined in: packages/blue-router/src/route.ts:27

***

### id

> **id**: `number`

Defined in: packages/blue-router/src/route.ts:28

***

### method?

> `optional` **method?**: `HTTPMethod`

Defined in: packages/blue-router/src/route.ts:29

***

### params

> **params**: `TParams` \| `null`

Defined in: packages/blue-router/src/route.ts:30

***

### path

> **path**: `string`

Defined in: packages/blue-router/src/route.ts:31

***

### raw

> **raw**: `string`

Defined in: packages/blue-router/src/route.ts:32

***

### attributes

> **attributes**: `Record`\<`string`, `unknown`\>

Defined in: packages/blue-router/src/route.ts:33

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`Serializable.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`Serializable.toJSON`
