[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractNameValueExpression

# Abstract Class: AbstractNameValueExpression\<T\>

Defined in: [packages/blue-dispatcher/src/route-condition.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-63)

Base class for parsed name/value expressions.

## Extended by

- [`QueryParamExpression`](QueryParamExpression.md)
- [`MatrixParamExpression`](MatrixParamExpression.md)

## Type Parameters

### T

`T`

## Implements

- [`NameValueExpression`](../interfaces/NameValueExpression.md)\<`T`\>
- `Serializable`

## Constructors

### Constructor

> **new AbstractNameValueExpression**\<`T`\>(`expression`): `AbstractNameValueExpression`\<`T`\>

Defined in: [packages/blue-dispatcher/src/route-condition.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-75)

Parse a name/value expression.

#### Parameters

##### expression

`string`

The expression to parse.

#### Returns

`AbstractNameValueExpression`\<`T`\>

## Properties

### isNegated

> `readonly` **isNegated**: `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-64)

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`isNegated`](../interfaces/NameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-65)

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`name`](../interfaces/NameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `T`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-66)

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`value`](../interfaces/NameValueExpression.md#value)

***

### isCaseSensitiveName

> `abstract` `readonly` **isCaseSensitiveName**: `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-68)

## Methods

### match()

> **match**(`route`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:118](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-118)

Determine whether this expression matches the given route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the expression matches.

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-128)

Serialize the expression to JSON.

#### Returns

`JSONValue`

The string form of the expression.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:137](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-137)

Convert the expression to its textual form.

#### Returns

`string`

The expression string.

#### Implementation of

`Serializable.toString`

***

### matchName()

> `abstract` **matchName**(`route`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-142)

#### Parameters

##### route

[`Route`](#)

#### Returns

`boolean`

***

### matchValue()

> `abstract` **matchValue**(`route`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:143](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-143)

#### Parameters

##### route

[`Route`](#)

#### Returns

`boolean`

***

### parseValue()

> `abstract` **parseValue**(`valueExpression`): `T`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:144](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-144)

#### Parameters

##### valueExpression

`string`

#### Returns

`T`
