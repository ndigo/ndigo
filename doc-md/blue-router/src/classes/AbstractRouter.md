[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / AbstractRouter

# Abstract Class: AbstractRouter

Defined in: packages/blue-router/src/router.ts:10

## Implements

- [`Router`](../interfaces/Router.md)
- `RouterInterceptorRegistry`

## Constructors

### Constructor

> **new AbstractRouter**(): `AbstractRouter`

#### Returns

`AbstractRouter`

## Properties

### route

> **route**: `string`

Defined in: packages/blue-router/src/router.ts:13

#### Implementation of

[`Router`](../interfaces/Router.md).[`route`](../interfaces/Router.md#route)

***

### callback

> **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

Defined in: packages/blue-router/src/router.ts:14

#### Implementation of

[`Router`](../interfaces/Router.md).[`callback`](../interfaces/Router.md#callback)

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/src/router.ts:16

#### Parameters

##### interceptor

`RouterInterceptor`

#### Returns

`void`

#### Implementation of

`RouterInterceptorRegistry.addInterceptor`
