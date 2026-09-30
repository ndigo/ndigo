[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / HTTPMethodCondition

# Class: HTTPMethodCondition

Matches a route's `method` against a required HTTP method.

## Example

```ts
// A GET-only mapping
const condition = new HTTPMethodCondition('GET');
condition.getMatchingCondition({ method: 'GET', … } as Route) // this
condition.getMatchingCondition({ method: 'POST', … } as Route) // null
```

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`HTTPMethodCondition`\>

## Constructors

### Constructor

> **new HTTPMethodCondition**(`method?`): `HTTPMethodCondition`

Create a method condition.

#### Parameters

##### method?

`HTTPMethod`

The required HTTP method. Omit for any-method matching.

#### Returns

`HTTPMethodCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### method

> `readonly` **method**: `HTTPMethod` \| `undefined`

The required HTTP method, or `undefined` to match any method.

## Accessors

### content

#### Get Signature

> **get** **content**(): `HTTPMethod`[]

##### Returns

`HTTPMethod`[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

## Methods

### compareTo()

> **compareTo**(`value`, `route?`): `number`

A concrete method is more specific than the any-method condition.

For a `HEAD` request, an explicit `HEAD` mapping is more specific than
a `GET` mapping reached only through the HEAD→GET fallback — RFC 9110
§9.3.2 requires the explicit mapping to win regardless of registration
order (COR-10). The fallback still serves HEAD when no HEAD mapping
exists: without a `route` (or for non-HEAD requests) the two concrete
conditions remain equally specific.

#### Parameters

##### value

`HTTPMethodCondition`

The condition to compare.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The current route, when known.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)

***

### equals()

> **equals**(`value`): `boolean`

Compare this condition to another value.

#### Parameters

##### value

`unknown`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `HTTPMethodCondition` \| `null`

Return this condition when the route's method matches (or this condition
has no method constraint); `null` otherwise.

A `HEAD` request matches a `GET`-constrained mapping when no HEAD
mapping exists (RFC 9110 §9.3.2: HEAD is GET without the message body).
Node's `ServerResponse` suppresses the body natively for HEAD while
keeping the headers — conditional-GET revalidation probes (caches,
`curl -I`) rely on this.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`HTTPMethodCondition` \| `null`

This condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### merge()

> **merge**(`other`): `HTTPMethodCondition`

Merge two conditions. A concrete method wins over `undefined`; when both
specify a method, `other` (the method-level mapping) wins as the more
specific of the two.

#### Parameters

##### other

`HTTPMethodCondition`

The condition to merge with.

#### Returns

`HTTPMethodCondition`

The merged condition.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

The method name, or an empty string for the any-method condition.

#### Returns

`string`

The method or `''`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)
