[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route](../README.md) / Route

# Interface: Route\<TParams\>

Represents a complete route, composed of multiple segments, along with its parameters, path, and associated data.
It extends `ArrayLike<RouteSegment>` to allow iteration over its segments.

## Since

1.0.0

## Extends

- `ArrayLike`\<[`RouteSegment`](RouteSegment.md)\>
- `Serializable`

## Type Parameters

### TParams

`TParams` *extends* `Record`\<`string`, `string`\> = `Record`\<`string`, `string`\>

A type representing the route parameters, defaulting to `Record<string, string>`.

## Indexable

> \[`n`: `number`\]: [`RouteSegment`](RouteSegment.md)

## Properties

### attributes

> **attributes**: `Record`\<`string`, `unknown`\>

***

### data

> **data**: `JSONObject`

***

### dataString?

> `optional` **dataString?**: `string`

***

### id

> **id**: `string`

***

### method?

> `optional` **method?**: `HTTPMethod`

***

### params

> **params**: `TParams` \| `null`

***

### path

> **path**: `string`

***

### raw

> **raw**: `string`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

#### Inherited from

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`Serializable.toString`
