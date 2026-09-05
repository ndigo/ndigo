[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MethodParameter

# Class: MethodParameter

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:126](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-126)

Method parameter metadata

## Implements

- `Serializable`

## Constructors

### Constructor

> **new MethodParameter**(`type`, `name`, `required?`, `defaultValue?`, `convertType?`, `prefix?`): `MethodParameter`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:134](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-134)

#### Parameters

##### type

[`MethodParameterType`](MethodParameterType.md)

##### name

`string`

##### required?

`boolean` = `false`

##### defaultValue?

`string` \| `null`

##### convertType?

###### source

`any`

###### target

`any`

##### prefix?

`string` \| `null`

#### Returns

`MethodParameter`

## Properties

### name

> `readonly` **name**: `string`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:127](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-127)

***

### type

> `readonly` **type**: [`MethodParameterType`](MethodParameterType.md)

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-128)

***

### required

> `readonly` **required**: `boolean`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:129](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-129)

***

### defaultValue

> `readonly` **defaultValue**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:130](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-130)

***

### convertType

> `readonly` **convertType**: \{ `source`: `any`; `target`: `any`; \} \| `undefined`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:131](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-131)

***

### prefix

> `readonly` **prefix**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-132)

## Methods

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:153](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-153)

#### Returns

`JSONObject`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:164](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-164)

#### Returns

`string`

#### Implementation of

`Serializable.toString`
