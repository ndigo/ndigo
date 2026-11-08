[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [path-route](../README.md) / PathRoute

# Class: PathRoute

Represents a concrete route based on a URL path, parsing segments, matrix parameters, and query strings.
It implements `Route` and `Serializable`.

## Type Param

**TParams**

A type representing the route parameters, defaulting to `Record<string, string>`.

## Implements

- [`Route`](../../route/interfaces/Route.md)\<`Record`\<`string`, `string`\>\>
- `Serializable`
- [`Matchable`](#)\<`string`\>

## Indexable

> \[`n`: `number`\]: [`RouteSegment`](../../route/interfaces/RouteSegment.md)

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

## Properties

### attributes

> `readonly` **attributes**: `Record`\<`string`, `unknown`\>

Additional route attributes.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`attributes`](../../route/interfaces/Route.md#attributes)

***

### data

> `readonly` **data**: `JSONObject`

The query/matrix data.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`data`](../../route/interfaces/Route.md#data)

***

### dataString?

> `readonly` `optional` **dataString?**: `string`

The raw query string.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`dataString`](../../route/interfaces/Route.md#datastring)

***

### id

> `readonly` **id**: `string`

The unique route id.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`id`](../../route/interfaces/Route.md#id)

***

### method?

> `optional` **method?**: `HTTPMethod`

The HTTP method, when known.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`method`](../../route/interfaces/Route.md#method)

***

### params

> **params**: `Record`\<`string`, `string`\> \| `null`

The parsed route parameters.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`params`](../../route/interfaces/Route.md#params)

***

### path

> `readonly` **path**: `string`

The route path.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`path`](../../route/interfaces/Route.md#path)

***

### raw

> `readonly` **raw**: `string`

The raw route text.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`raw`](../../route/interfaces/Route.md#raw)

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Gets the number of segments in the route.

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

***

### toJSON()

> **toJSON**(): `JSONValue`

Serializes the `PathRoute` instance to a JSON object.

#### Returns

`JSONValue`

A `JSONValue` representation of the route.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`toJSON`](../../route/interfaces/Route.md#tojson)

***

### toString()

> **toString**(): `string`

Returns the string representation of the `PathRoute`, including its segments and query string.

#### Returns

`string`

The string representation of the route.

#### Implementation of

[`Route`](../../route/interfaces/Route.md).[`toString`](../../route/interfaces/Route.md#tostring)
