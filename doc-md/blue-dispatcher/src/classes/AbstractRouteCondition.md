[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractRouteCondition

# Abstract Class: AbstractRouteCondition\<T\>

Defined in: [packages/blue-dispatcher/src/route-condition.ts:147](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-147)

Contract for route matching conditions.

## Extended by

- [`RouteConditionHolder`](RouteConditionHolder.md)
- [`CompositeRouteCondition`](CompositeRouteCondition.md)
- [`AccessControlCondition`](AccessControlCondition.md)
- [`HTTPMethodCondition`](HTTPMethodCondition.md)
- [`QueryParamCondition`](QueryParamCondition.md)
- [`MatrixParamCondition`](MatrixParamCondition.md)
- [`PatternsRouteCondition`](PatternsRouteCondition.md)

## Type Parameters

### T

`T` *extends* `AbstractRouteCondition`\<`T`\>

## Implements

- `Equatable`
- [`RouteCondition`](../interfaces/RouteCondition.md)\<`T`\>
- `Serializable`

## Constructors

### Constructor

> **new AbstractRouteCondition**\<`T`\>(): `AbstractRouteCondition`\<`T`\>

#### Returns

`AbstractRouteCondition`\<`T`\>

## Properties

### content

> `abstract` **content**: `any`[]

Defined in: [packages/blue-dispatcher/src/route-condition.ts:157](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-157)

***

### infix

> `abstract` **infix**: `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:158](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-158)

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:153](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-153)

Whether this condition contains no content.

##### Returns

`boolean`

## Methods

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

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:181](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-181)

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:190](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-190)

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Implementation of

`Serializable.toString`

***

### merge()

> `abstract` **merge**(`other`): `T`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:194](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-194)

Merge this condition with another condition of the same type.

#### Parameters

##### other

`T`

#### Returns

`T`

The merged condition.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`merge`](../interfaces/RouteCondition.md#merge)

***

### getMatchingCondition()

> `abstract` **getMatchingCondition**(`route`): `T` \| `null`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:196](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-196)

Return the condition that matches a route, or `null` when no match exists.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`T` \| `null`

A matching condition instance or `null`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`getMatchingCondition`](../interfaces/RouteCondition.md#getmatchingcondition)

***

### compareTo()

> `abstract` **compareTo**(`value`, `route?`): `number`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:198](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-198)

Compare this condition with another condition.

#### Parameters

##### value

`T`

The condition to compare against.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed.

#### Returns

`number`

A comparison result compatible with `Array.prototype.sort`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)
