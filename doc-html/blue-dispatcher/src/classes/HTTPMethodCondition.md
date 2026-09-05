[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / HTTPMethodCondition

# Class: HTTPMethodCondition

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-28)

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

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-47)

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

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-32)

The required HTTP method, or `undefined` to match any method.

## Accessors

### content

#### Get Signature

> **get** **content**(): `HTTPMethod`[]

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-34)

##### Returns

`HTTPMethod`[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-38)

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:153](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-153)

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

## Methods

### merge()

> **merge**(`other`): `HTTPMethodCondition`

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-65)

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

### getMatchingCondition()

> **getMatchingCondition**(`route`): `HTTPMethodCondition` \| `null`

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-76)

Return this condition when the route's method matches (or this condition
has no method constraint); `null` otherwise.

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

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:90](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-90)

A concrete method is more specific than the any-method condition.

#### Parameters

##### value

`HTTPMethodCondition`

The condition to compare.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

Unused, part of the shared contract.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/http-method-condition.ts:105](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-condition.ts#lines-105)

The method name, or an empty string for the any-method condition.

#### Returns

`string`

The method or `''`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)

***

### equals()

> **equals**(`value`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:166](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-166)

Compare this condition to another value.

#### Parameters

##### value

`any`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:181](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-181)

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)
