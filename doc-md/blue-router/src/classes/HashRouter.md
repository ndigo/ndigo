[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / HashRouter

# Class: HashRouter

Defined in: packages/blue-router/src/hash-router.ts:94

A hash-based router implementation for browser environments that extends `AbstractRouter`.
It manages routing based on the URL hash fragment, supports route interceptors, and maintains a route history.
This class structurally conforms to the `Destroyable` shape (`destroyed` + `destroy()`) without importing the interface,
so `likeDestroyable` checks can still identify it by duck typing.

## Since

1.0.0

## Extends

- [`AbstractRouter`](AbstractRouter.md)

## Constructors

### Constructor

> **new HashRouter**(`callback`): `HashRouter`

Defined in: packages/blue-router/src/hash-router.ts:141

Creates an instance of `HashRouter`.

#### Parameters

##### callback

[`RouterCallback`](../type-aliases/RouterCallback.md)

The `RouterCallback` to be invoked when the route changes.

#### Returns

`HashRouter`

#### Since

1.0.0

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`constructor`](AbstractRouter.md#constructor)

## Properties

### callback

> `readonly` **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

Defined in: packages/blue-router/src/hash-router.ts:101

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`callback`](AbstractRouter.md#callback)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-router/src/hash-router.ts:116

Indicates whether the router has been destroyed and its event listeners removed.

#### Since

1.0.0

## Accessors

### route

#### Get Signature

> **get** **route**(): `string`

Defined in: packages/blue-router/src/hash-router.ts:108

Gets the current route as a string.

##### Since

1.0.0

##### Returns

`string`

The string representation of the current route, or an empty string if no route is set.

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`route`](AbstractRouter.md#route)

***

### history

#### Get Signature

> **get** **history**(): `RouteHistory`

Defined in: packages/blue-router/src/hash-router.ts:123

Gets the `RingBuffer` instance that stores the route history.

##### Since

1.0.0

##### Returns

`RouteHistory`

The route history buffer.

***

### transactionManager

#### Get Signature

> **get** **transactionManager**(): [`RouteTransactionManager`](../interfaces/RouteTransactionManager.md)

Defined in: packages/blue-router/src/hash-router.ts:132

Gets the `RouteTransactionManager` instance used by the router.

##### Since

1.0.0

##### Returns

[`RouteTransactionManager`](../interfaces/RouteTransactionManager.md)

The transaction manager.

***

### interceptors

#### Get Signature

> **get** `protected` **interceptors**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

Defined in: packages/blue-router/src/router.ts:60

Returns the list of registered `RouterInterceptor` instances.

##### Since

1.0.0

##### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)[]

An array of `RouterInterceptor`.

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`interceptors`](AbstractRouter.md#interceptors)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-router/src/hash-router.ts:177

Destroys the router by removing its `hashchange` event listener.
Once destroyed, the router will no longer respond to URL hash changes.

#### Returns

`void`

#### Since

1.0.0

***

### setRoute()

> **setRoute**(`newRoute`, `isPublic?`): `Promise`\<`void`\>

Defined in: packages/blue-router/src/hash-router.ts:198

Programmatically sets a new route for the router.
This method will trigger route interceptors and update the browser's hash if `isPublic` is `true`.

#### Parameters

##### newRoute

`string`

The new route string to set.

##### isPublic?

`boolean` = `true`

`true` if the route change should be reflected in the browser's URL hash and recorded as a public route, `false` for internal/private route changes. Defaults to `true`.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the route has been successfully set and processed.

#### Since

1.0.0

***

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-router/src/hash-router.ts:216

Refreshes the current route by re-invoking the router's callback with the current route.
This can be useful to re-apply routing logic or update UI components without a full navigation.

#### Returns

`void`

#### Since

1.0.0

#### Overrides

[`AbstractRouter`](AbstractRouter.md).[`refresh`](AbstractRouter.md#refresh)

***

### navigate()

> **navigate**(`path`): `Promise`\<`void`\>

Defined in: packages/blue-router/src/hash-router.ts:232

Programmatically navigates to the given route path.

Delegates to [setRoute](#setroute) with `isPublic = true`, updating the browser hash and
triggering the routing pipeline.

#### Parameters

##### path

`string`

The target route string to navigate to.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the route has been set and processed.

#### Since

1.0.0

***

### \_onHashChange()

> `protected` **\_onHashChange**(`event`): `void`

Defined in: packages/blue-router/src/hash-router.ts:242

Handles the native `hashchange` event, extracting the new route and initiating the routing process.

#### Parameters

##### event

`HashChangeEvent`

The `HashChangeEvent` object.

#### Returns

`void`

#### Since

1.0.0

***

### \_setRoute()

> `protected` **\_setRoute**(`newRoute`, `syncHash?`): `Promise`\<`boolean`\>

Defined in: packages/blue-router/src/hash-router.ts:263

Internal method to set a new route, apply interceptors, and manage the route transaction.

#### Parameters

##### newRoute

`string`

The new route string to set.

##### syncHash?

`boolean` = `true`

`true` if the browser hash should be updated, `false` otherwise. Defaults to `true`.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the route was successfully set and processed, `false` otherwise.

#### Since

1.0.0

***

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/src/router.ts:70

Adds a `RouterInterceptor` to the router. Interceptors are processed in the order they are added.
Duplicate interceptors are ignored.

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

The `RouterInterceptor` to add.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`addInterceptor`](AbstractRouter.md#addinterceptor)

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Defined in: packages/blue-router/src/router.ts:85

Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.

#### Parameters

##### interceptorOrPatterns

`string` \| `string`[] \| [`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

Either a `RouterInterceptor`, `RouterMiddleware`, a single include pattern string, or an array of include pattern strings.

##### interceptor?

[`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The `RouterInterceptor` or `RouterMiddleware` to apply when `interceptorOrPatterns` defines patterns. Required if patterns are provided.

##### excludePatterns?

`string`[] = `[]`

An optional array of patterns to exclude from matching.

#### Returns

`void`

#### Throws

If `interceptor` is not provided when `interceptorOrPatterns` defines patterns.

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`use`](AbstractRouter.md#use)

***

### \_toRouterInterceptor()

> `protected` **\_toRouterInterceptor**(`interceptor`): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)

Defined in: packages/blue-router/src/router.ts:116

Converts a `RouterMiddleware` function into a `RouterInterceptor` object.
If the input is already a `RouterInterceptor`, it is returned as is.

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md) \| [`RouterMiddleware`](../type-aliases/RouterMiddleware.md)

The `RouterInterceptor` or `RouterMiddleware` to convert.

#### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

A `RouterInterceptor` instance.

#### Since

1.0.0

#### Inherited from

[`AbstractRouter`](AbstractRouter.md).[`_toRouterInterceptor`](AbstractRouter.md#_torouterinterceptor)
