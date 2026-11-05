[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [path-route](../README.md) / PathRouteSegment

# Class: PathRouteSegment

Represents a single segment of a `PathRoute`, including its name, matrix parameters, and raw string value.
It implements `RouteSegment` and `Serializable`.

## Since

1.0.0

## Implements

- [`RouteSegment`](../../route/interfaces/RouteSegment.md)
- `Serializable`

## Constructors

### Constructor

> **new PathRouteSegment**(`segment`): `PathRouteSegment`

Creates an instance of `PathRouteSegment` from a raw segment string.
The segment string can include matrix parameters (e.g., `segment;key=value`).

#### Parameters

##### segment

`string`

The raw string representation of the route segment.

#### Returns

`PathRouteSegment`

#### Since

1.0.0

## Properties

### data

> `readonly` **data**: `JSONObject`

#### Implementation of

[`RouteSegment`](../../route/interfaces/RouteSegment.md).[`data`](../../route/interfaces/RouteSegment.md#data)

***

### dataString?

> `readonly` `optional` **dataString?**: `string`

#### Implementation of

[`RouteSegment`](../../route/interfaces/RouteSegment.md).[`dataString`](../../route/interfaces/RouteSegment.md#datastring)

***

### name

> `readonly` **name**: `string`

#### Implementation of

[`RouteSegment`](../../route/interfaces/RouteSegment.md).[`name`](../../route/interfaces/RouteSegment.md#name)

***

### raw

> `readonly` **raw**: `string`

#### Implementation of

[`RouteSegment`](../../route/interfaces/RouteSegment.md).[`raw`](../../route/interfaces/RouteSegment.md#raw)

## Methods

### toJSON()

> **toJSON**(): `JSONValue`

Serializes the `PathRouteSegment` instance to a JSON object.

#### Returns

`JSONValue`

A `JSONValue` representation of the segment.

#### Since

1.0.0

#### Implementation of

[`RouteSegment`](../../route/interfaces/RouteSegment.md).[`toJSON`](../../route/interfaces/RouteSegment.md#tojson)

***

### toString()

> **toString**(): `string`

Returns the string representation of the `PathRouteSegment`, including its name and matrix parameters.

#### Returns

`string`

The string representation of the segment.

#### Since

1.0.0

#### Implementation of

[`RouteSegment`](../../route/interfaces/RouteSegment.md).[`toString`](../../route/interfaces/RouteSegment.md#tostring)
