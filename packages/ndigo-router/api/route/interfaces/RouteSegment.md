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

***

### dataString?

> `optional` **dataString?**: `string`

***

### name

> **name**: `string`

***

### raw

> **raw**: `string`

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
