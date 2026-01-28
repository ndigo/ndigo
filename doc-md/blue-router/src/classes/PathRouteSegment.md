[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / PathRouteSegment

# Class: PathRouteSegment

Defined in: packages/blue-router/src/path-route.ts:50

## Implements

- [`RouteSegment`](../interfaces/RouteSegment.md)
- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new PathRouteSegment**(`segment`): `PathRouteSegment`

Defined in: packages/blue-router/src/path-route.ts:56

#### Parameters

##### segment

`string`

#### Returns

`PathRouteSegment`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-router/src/path-route.ts:51

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`name`](../interfaces/RouteSegment.md#name)

***

### data

> `readonly` **data**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-router/src/path-route.ts:52

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`data`](../interfaces/RouteSegment.md#data)

***

### dataString?

> `readonly` `optional` **dataString**: `string`

Defined in: packages/blue-router/src/path-route.ts:53

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`dataString`](../interfaces/RouteSegment.md#datastring)

***

### raw

> `readonly` **raw**: `string`

Defined in: packages/blue-router/src/path-route.ts:54

#### Implementation of

[`RouteSegment`](../interfaces/RouteSegment.md).[`raw`](../interfaces/RouteSegment.md#raw)

## Methods

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-router/src/path-route.ts:117

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-router/src/path-route.ts:126

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)
