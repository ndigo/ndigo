[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route](../README.md) / Route

# Interface: Route\<TParams\>

Represents a complete route, composed of multiple segments, along with its parameters, path, and associated data.
It extends `ArrayLike<RouteSegment>` to allow iteration over its segments.

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

Additional route attributes.

***

### data

> **data**: `JSONObject`

The query/matrix data.

***

### dataString?

> `optional` **dataString?**: `string`

The raw query string.

***

### id

> **id**: `string`

The unique route id.

***

### method?

> `optional` **method?**: `HTTPMethod`

The HTTP method, when known.

***

### params

> **params**: `TParams` \| `null`

The parsed route parameters.

***

### path

> **path**: `string`

The route path.

***

### pattern?

> `optional` **pattern?**: `string`

The matched mapping pattern, when a handler mapping resolved this route.

***

### raw

> **raw**: `string`

The raw route text.

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Returns a JSON-safe representation of the value.

#### Returns

`JSONValue`

#### Inherited from

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

`Serializable.toString`
