[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / PathRouteSegment

# Class: PathRouteSegment

Defined in: [packages/blue-router/src/path-route.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-40)

Represents a single segment of a `PathRoute`, including its name, matrix parameters, and raw string value.
It implements `RouteSegment` and `Serializable`.

## Since

1.0.0

## Implements

- [`RouteSegment`](../interfaces/RouteSegment.md)
- `Serializable`

## Constructors

### Constructor

> **new PathRouteSegment**(`segment`): `PathRouteSegment`

Defined in: [packages/blue-router/src/path-route.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-52)

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

### name

> `readonly` **name**: `string`

Defined in: [packages/blue-router/src/path-route.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-41)

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`name`](../interfaces/RouteSegment.md#name)

***

### data

> `readonly` **data**: `JSONObject`

Defined in: [packages/blue-router/src/path-route.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-42)

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`data`](../interfaces/RouteSegment.md#data)

***

### dataString?

> `readonly` `optional` **dataString?**: `string`

Defined in: [packages/blue-router/src/path-route.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-43)

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`dataString`](../interfaces/RouteSegment.md#datastring)

***

### raw

> `readonly` **raw**: `string`

Defined in: [packages/blue-router/src/path-route.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-44)

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`raw`](../interfaces/RouteSegment.md#raw)

## Methods

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-router/src/path-route.ts:118](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-118)

Serializes the `PathRouteSegment` instance to a JSON object.

#### Returns

`JSONValue`

A `JSONValue` representation of the segment.

#### Since

1.0.0

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`toJSON`](../interfaces/RouteSegment.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-router/src/path-route.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/path-route.ts#lines-132)

Returns the string representation of the `PathRouteSegment`, including its name and matrix parameters.

#### Returns

`string`

The string representation of the segment.

#### Since

1.0.0

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`toString`](../interfaces/RouteSegment.md#tostring)
