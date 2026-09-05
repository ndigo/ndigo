[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameterType

# Class: MethodParameterType

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-51)

Method parameter type enum

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> **new MethodParameterType**(`type`): `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-89)

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

## Properties

### COOKIE

> `static` **COOKIE**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-52)

***

### MODEL

> `static` **MODEL**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-53)

***

### MATRIX

> `static` **MATRIX**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-54)

***

### PATH

> `static` **PATH**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:55](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-55)

***

### QUERY

> `static` **QUERY**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-56)

***

### STATE

> `static` **STATE**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-57)

***

### SESSION

> `static` **SESSION**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-58)

***

### BIND

> `static` **BIND**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-59)

***

### ATTRIBUTE

> `static` **ATTRIBUTE**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-60)

***

### HEADER

> `static` **HEADER**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:61](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-61)

***

### BODY

> `static` **BODY**: `MethodParameterType`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:62](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-62)

***

### type

> `readonly` **type**: `string`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:83](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-83)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-85)

##### Returns

`string`

## Methods

### fromType()

> `static` **fromType**(`type`): `MethodParameterType` \| `null`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-64)

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType` \| `null`

***

### equals()

> **equals**(`value`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:98](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-98)

Determines if this object is equal to the specified value.

#### Parameters

##### value

`any`

The value to compare with this object.

#### Returns

`boolean`

`true` if the objects are equal, `false` otherwise.

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `string`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:102](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-102)

#### Returns

`string`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:106](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-106)

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

`Serializable.toString`
