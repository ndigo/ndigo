[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / PathRoute

# Class: PathRoute

Defined in: packages/blue-router/src/path-route.ts:145

Represents a concrete route based on a URL path, parsing segments, matrix parameters, and query strings.
It implements `Route` and `Serializable`.

## Template

A type representing the route parameters, defaulting to `Record<string, string>`.

## Since

1.0.0

## Implements

- [`Route`](../interfaces/Route.md)\<`Record`\<`string`, `string`\>\>
- `Serializable`

## Indexable

> \[`n`: `number`\]: [`RouteSegment`](../interfaces/RouteSegment.md)

## Constructors

### Constructor

> **new PathRoute**(`route`): `PathRoute`

Defined in: packages/blue-router/src/path-route.ts:174

Creates an instance of `PathRoute` from a raw route string.
The route string can include path segments, matrix parameters, and a query string.

#### Parameters

##### route

`string`

The raw string representation of the route (e.g., `/foo;a=b/bar?c=d`).

#### Returns

`PathRoute`

#### Since

1.0.0

## Properties

### data

> `readonly` **data**: `JSONObject`

Defined in: packages/blue-router/src/path-route.ts:148

#### Implementation of

[`Route`](../interfaces/Route.md).[`data`](../interfaces/Route.md#data)

***

### dataString?

> `readonly` `optional` **dataString?**: `string`

Defined in: packages/blue-router/src/path-route.ts:149

#### Implementation of

[`Route`](../interfaces/Route.md).[`dataString`](../interfaces/Route.md#datastring)

***

### id

> `readonly` **id**: `number`

Defined in: packages/blue-router/src/path-route.ts:150

#### Implementation of

[`Route`](../interfaces/Route.md).[`id`](../interfaces/Route.md#id)

***

### params

> **params**: `Record`\<`string`, `string`\>

Defined in: packages/blue-router/src/path-route.ts:151

#### Implementation of

[`Route`](../interfaces/Route.md).[`params`](../interfaces/Route.md#params)

***

### path

> `readonly` **path**: `string`

Defined in: packages/blue-router/src/path-route.ts:152

#### Implementation of

[`Route`](../interfaces/Route.md).[`path`](../interfaces/Route.md#path)

***

### raw

> `readonly` **raw**: `string`

Defined in: packages/blue-router/src/path-route.ts:153

#### Implementation of

[`Route`](../interfaces/Route.md).[`raw`](../interfaces/Route.md#raw)

***

### attributes

> `readonly` **attributes**: `Record`\<`string`, `any`\>

Defined in: packages/blue-router/src/path-route.ts:154

#### Implementation of

[`Route`](../interfaces/Route.md).[`attributes`](../interfaces/Route.md#attributes)

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-router/src/path-route.ts:161

Gets the number of segments in the route.

##### Since

1.0.0

##### Returns

`number`

The number of route segments.

#### Implementation of

`Route.length`

## Methods

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-router/src/path-route.ts:261

Serializes the `PathRoute` instance to a JSON object.

#### Returns

`JSONValue`

A `JSONValue` representation of the route.

#### Since

1.0.0

#### Implementation of

[`Route`](../interfaces/Route.md).[`toJSON`](../interfaces/Route.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-router/src/path-route.ts:283

Returns the string representation of the `PathRoute`, including its segments and query string.

#### Returns

`string`

The string representation of the route.

#### Since

1.0.0

#### Implementation of

[`Route`](../interfaces/Route.md).[`toString`](../interfaces/Route.md#tostring)

***

### matches()

> **matches**(`pattern`): `boolean`

Defined in: packages/blue-router/src/path-route.ts:306

Checks if the current route matches a given pattern.
A pattern can include named parameters (e.g., `/users/:id` or `/products/{productId}`).

#### Parameters

##### pattern

`string`

The route pattern to match against.

#### Returns

`boolean`

`true` if the route matches the pattern, `false` otherwise.

#### Since

1.0.0

***

### resolveParams()

> **resolveParams**(`pattern`): `Record`\<`string`, `string`\>

Defined in: packages/blue-router/src/path-route.ts:317

Resolves and extracts parameters from the route based on a given pattern.
If the route matches the pattern, an object containing the resolved parameters is returned.

#### Parameters

##### pattern

`string`

The route pattern (e.g., `/users/:id` or `/products/{productId}`).

#### Returns

`Record`\<`string`, `string`\>

An object of resolved parameters if the route matches, or `null` if there is no match.

#### Since

1.0.0
