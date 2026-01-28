[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / HashRouter

# Class: HashRouter

Defined in: packages/blue-router/src/hash-router.ts:63

? Implement factory.Destroyable? It seems excessive to include @blue/factory just for the interface. Move factory.Destroyable to @blue/core? -JBR

## Implements

- [`Router`](../interfaces/Router.md)
- `RouterInterceptorRegistry`

## Constructors

### Constructor

> **new HashRouter**(`callback`): `HashRouter`

Defined in: packages/blue-router/src/hash-router.ts:81

#### Parameters

##### callback

[`RouterCallback`](../type-aliases/RouterCallback.md)

#### Returns

`HashRouter`

## Properties

### callback

> `readonly` **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

Defined in: packages/blue-router/src/hash-router.ts:69

#### Implementation of

[`Router`](../interfaces/Router.md).[`callback`](../interfaces/Router.md#callback)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-router/src/hash-router.ts:75

## Accessors

### route

#### Get Signature

> **get** **route**(): `string`

Defined in: packages/blue-router/src/hash-router.ts:71

##### Returns

`string`

#### Implementation of

[`Router`](../interfaces/Router.md).[`route`](../interfaces/Router.md#route)

***

### history

#### Get Signature

> **get** **history**(): `RouteHistory`

Defined in: packages/blue-router/src/hash-router.ts:77

##### Returns

`RouteHistory`

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/src/hash-router.ts:109

#### Parameters

##### interceptor

`RouterInterceptor`

#### Returns

`void`

#### Implementation of

`RouterInterceptorRegistry.addInterceptor`

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-router/src/hash-router.ts:114

#### Returns

`void`

***

### setRoute()

> **setRoute**(`newRoute`, `isPublic`): `void`

Defined in: packages/blue-router/src/hash-router.ts:127

#### Parameters

##### newRoute

`string`

##### isPublic

`boolean` = `true`

#### Returns

`void`

***

### \_onHashChange()

> `protected` **\_onHashChange**(`event`): `void`

Defined in: packages/blue-router/src/hash-router.ts:136

#### Parameters

##### event

`HashChangeEvent`

#### Returns

`void`

***

### \_setRoute()

> `protected` **\_setRoute**(`newRoute`): `boolean`

Defined in: packages/blue-router/src/hash-router.ts:146

#### Parameters

##### newRoute

`string`

#### Returns

`boolean`
