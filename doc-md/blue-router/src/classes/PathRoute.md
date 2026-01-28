[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / PathRoute

# Class: PathRoute

Defined in: packages/blue-router/src/path-route.ts:137

## Implements

- [`Route`](../interfaces/Route.md)
- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Indexable

\[`n`: `number`\]: [`RouteSegment`](../interfaces/RouteSegment.md)

## Constructors

### Constructor

> **new PathRoute**(`route`): `PathRoute`

Defined in: packages/blue-router/src/path-route.ts:162

#### Parameters

##### route

`string`

#### Returns

`PathRoute`

## Properties

### data

> `readonly` **data**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-router/src/path-route.ts:140

#### Implementation of

[`Route`](../interfaces/Route.md).[`data`](../interfaces/Route.md#data)

***

### dataString?

> `readonly` `optional` **dataString**: `string`

Defined in: packages/blue-router/src/path-route.ts:141

#### Implementation of

[`Route`](../interfaces/Route.md).[`dataString`](../interfaces/Route.md#datastring)

***

### id

> `readonly` **id**: `number`

Defined in: packages/blue-router/src/path-route.ts:142

#### Implementation of

[`Route`](../interfaces/Route.md).[`id`](../interfaces/Route.md#id)

***

### path

> `readonly` **path**: `string`

Defined in: packages/blue-router/src/path-route.ts:143

#### Implementation of

[`Route`](../interfaces/Route.md).[`path`](../interfaces/Route.md#path)

***

### raw

> `readonly` **raw**: `string`

Defined in: packages/blue-router/src/path-route.ts:144

#### Implementation of

[`Route`](../interfaces/Route.md).[`raw`](../interfaces/Route.md#raw)

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-router/src/path-route.ts:146

##### Returns

`number`

#### Implementation of

`Route.length`

## Methods

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-router/src/path-route.ts:230

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-router/src/path-route.ts:246

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)
