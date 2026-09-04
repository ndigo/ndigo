[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserRouter

# Class: BrowserRouter

Defined in: packages/blue-platform-web/src/browser-router.ts:60

A History API-based router implementation for browser environments.

Uses `pushState`/`popstate` for clean URLs without hash fragments.
Follows the same pattern as `HashRouter` but uses the History API.

## Example

```ts
const router = new BrowserRouter((route) => {
  dispatcher.dispatch(route);
});
```

## Extends

- `AbstractRouter`

## Constructors

### Constructor

> **new BrowserRouter**(`callback`): `BrowserRouter`

Defined in: packages/blue-platform-web/src/browser-router.ts:84

Creates an instance of `BrowserRouter`.

#### Parameters

##### callback

`RouterCallback`

The `RouterCallback` to be invoked when the route changes.
  Called with a `PathRoute` representing the current URL path.

#### Returns

`BrowserRouter`

#### Overrides

`AbstractRouter.constructor`

## Properties

### callback

> `readonly` **callback**: `RouterCallback`

Defined in: packages/blue-platform-web/src/browser-router.ts:66

#### Overrides

`AbstractRouter.callback`

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-platform-web/src/browser-router.ts:72

## Accessors

### route

#### Get Signature

> **get** **route**(): `string`

Defined in: packages/blue-platform-web/src/browser-router.ts:68

##### Returns

`string`

#### Overrides

`AbstractRouter.route`

***

### history

#### Get Signature

> **get** **history**(): `RingBuffer`\<`RouteTransaction`\>

Defined in: packages/blue-platform-web/src/browser-router.ts:74

##### Returns

`RingBuffer`\<`RouteTransaction`\>

***

### interceptors

#### Get Signature

> **get** `protected` **interceptors**(): `RouterInterceptor`[]

Defined in: packages/blue-router/lib/router.d.ts:46

Returns the list of registered `RouterInterceptor` instances.

##### Since

1.0.0

##### Returns

`RouterInterceptor`[]

An array of `RouterInterceptor`.

#### Inherited from

`AbstractRouter.interceptors`

## Methods

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-platform-web/src/browser-router.ts:117

Destroys the router by removing its `popstate` event listener.

#### Returns

`void`

***

### setRoute()

> **setRoute**(`newRoute`, `isPublic?`): `Promise`\<`void`\>

Defined in: packages/blue-platform-web/src/browser-router.ts:139

Programmatically sets a new route.

Updates the browser URL via `pushState` when `isPublic` is `true`.

#### Parameters

##### newRoute

`string`

The new route string to set.

##### isPublic?

`boolean` = `true`

`true` to update the browser URL, `false` for internal changes.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the route has been processed.

***

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-platform-web/src/browser-router.ts:156

Refreshes the current route by re-invoking the callback.

#### Returns

`void`

#### Overrides

`AbstractRouter.refresh`

***

### navigate()

> **navigate**(`path`): `Promise`\<`void`\>

Defined in: packages/blue-platform-web/src/browser-router.ts:170

Programmatically navigates to the given path.

Updates the browser URL and triggers the routing pipeline.

#### Parameters

##### path

`string`

The target path to navigate to.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the route has been processed.

***

### \_onPopState()

> `protected` **\_onPopState**(`_event`): `void`

Defined in: packages/blue-platform-web/src/browser-router.ts:177

Handles the native `popstate` event (back/forward navigation).

#### Parameters

##### \_event

`PopStateEvent`

#### Returns

`void`

***

### \_setRoute()

> `protected` **\_setRoute**(`newRoute`, `syncHash?`): `Promise`\<`boolean`\>

Defined in: packages/blue-platform-web/src/browser-router.ts:194

Internal method to set a new route, apply interceptors, and manage the transaction.

#### Parameters

##### newRoute

`string`

##### syncHash?

`boolean` = `true`

#### Returns

`Promise`\<`boolean`\>

***

### \_resolveInterceptors()

> `protected` **\_resolveInterceptors**(`route`): `RouterInterceptor`[]

Defined in: packages/blue-platform-web/src/browser-router.ts:212

Resolves matching interceptors for the given route.

#### Parameters

##### route

`PathRoute`

#### Returns

`RouterInterceptor`[]

***

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-router/lib/router.d.ts:53

Adds a `RouterInterceptor` to the router. Interceptors are processed in the order they are added.
Duplicate interceptors are ignored.

#### Parameters

##### interceptor

`RouterInterceptor`

The `RouterInterceptor` to add.

#### Returns

`void`

#### Since

1.0.0

#### Inherited from

`AbstractRouter.addInterceptor`

***

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

Defined in: packages/blue-router/lib/router.d.ts:63

Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.

#### Parameters

##### interceptorOrPatterns

`string` \| `string`[] \| `RouterInterceptor` \| `RouterMiddleware`

Either a `RouterInterceptor`, `RouterMiddleware`, a single include pattern string, or an array of include pattern strings.

##### interceptor?

`RouterInterceptor` \| `RouterMiddleware`

The `RouterInterceptor` or `RouterMiddleware` to apply when `interceptorOrPatterns` defines patterns. Required if patterns are provided.

##### excludePatterns?

`string`[]

An optional array of patterns to exclude from matching.

#### Returns

`void`

#### Throws

If `interceptor` is not provided when `interceptorOrPatterns` defines patterns.

#### Since

1.0.0

#### Inherited from

`AbstractRouter.use`

***

### \_toRouterInterceptor()

> `protected` **\_toRouterInterceptor**(`interceptor`): `RouterInterceptor`

Defined in: packages/blue-router/lib/router.d.ts:72

Converts a `RouterMiddleware` function into a `RouterInterceptor` object.
If the input is already a `RouterInterceptor`, it is returned as is.

#### Parameters

##### interceptor

`RouterInterceptor` \| `RouterMiddleware`

The `RouterInterceptor` or `RouterMiddleware` to convert.

#### Returns

`RouterInterceptor`

A `RouterInterceptor` instance.

#### Since

1.0.0

#### Inherited from

`AbstractRouter._toRouterInterceptor`
