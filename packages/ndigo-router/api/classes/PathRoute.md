[**@ndigo/router v0.0.1**](../README.md)

***

[@ndigo/router](../README.md) / PathRoute

# Class: PathRoute

Represents a concrete route based on a URL path, parsing segments, matrix parameters, and query strings.
It implements `Route` and `Serializable`.

## Template

**TParams**

A type representing the route parameters, defaulting to `Record<string, string>`.

## Since

1.0.0

## Implements

- [`Route`](../interfaces/Route.md)\<`Record`\<`string`, `string`\>\>
- `Serializable`
- [`Matchable`](#)\<`string`\>

## Indexable

> \[`n`: `number`\]: [`RouteSegment`](../interfaces/RouteSegment.md)

## Constructors

### Constructor

> **new PathRoute**(`route`): `PathRoute`

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

### attributes

> `readonly` **attributes**: `Record`\<`string`, `unknown`\>

#### Implementation of

[`Route`](../interfaces/Route.md).[`attributes`](../interfaces/Route.md#attributes)

***

### data

> `readonly` **data**: `JSONObject`

#### Implementation of

[`Route`](../interfaces/Route.md).[`data`](../interfaces/Route.md#data)

***

### dataString?

> `readonly` `optional` **dataString?**: `string`

#### Implementation of

[`Route`](../interfaces/Route.md).[`dataString`](../interfaces/Route.md#datastring)

***

### id

> `readonly` **id**: `string`

#### Implementation of

[`Route`](../interfaces/Route.md).[`id`](../interfaces/Route.md#id)

***

### method?

> `optional` **method?**: `HTTPMethod`

#### Implementation of

[`Route`](../interfaces/Route.md).[`method`](../interfaces/Route.md#method)

***

### params

> **params**: `Record`\<`string`, `string`\> \| `null`

#### Implementation of

[`Route`](../interfaces/Route.md).[`params`](../interfaces/Route.md#params)

***

### path

> `readonly` **path**: `string`

#### Implementation of

[`Route`](../interfaces/Route.md).[`path`](../interfaces/Route.md#path)

***

### raw

> `readonly` **raw**: `string`

#### Implementation of

[`Route`](../interfaces/Route.md).[`raw`](../interfaces/Route.md#raw)

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Gets the number of segments in the route.

##### Since

1.0.0

##### Returns

`number`

The number of route segments.

#### Implementation of

`Route.length`

## Methods

### matches()

> **matches**(`pattern`): `boolean`

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

#### Implementation of

`Matchable.matches`

***

### resolveParams()

> **resolveParams**(`pattern`): `Record`\<`string`, `string`\> \| `null`

Resolves and extracts parameters from the route based on a given pattern.
If the route matches the pattern, an object containing the resolved parameters is returned.

#### Parameters

##### pattern

`string`

The route pattern (e.g., `/users/:id` or `/products/{productId}`).

#### Returns

`Record`\<`string`, `string`\> \| `null`

An object of resolved parameters if the route matches, or `null` if there is no match.

#### Since

1.0.0

***

### toJSON()

> **toJSON**(): `JSONValue`

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

Returns the string representation of the `PathRoute`, including its segments and query string.

#### Returns

`string`

The string representation of the route.

#### Since

1.0.0

#### Implementation of

[`Route`](../interfaces/Route.md).[`toString`](../interfaces/Route.md#tostring)
