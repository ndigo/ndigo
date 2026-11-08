[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route](../README.md) / RouteSegment

# Interface: RouteSegment

Represents a single segment within a route, including its name, associated data, and raw string value.

## Extends

- `Serializable`

## Properties

### data

> **data**: `JSONObject`

The parsed matrix-parameter data.

***

### dataString?

> `optional` **dataString?**: `string`

The raw matrix-parameter string.

***

### name

> **name**: `string`

The segment name.

***

### raw

> **raw**: `string`

The raw segment text.

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
