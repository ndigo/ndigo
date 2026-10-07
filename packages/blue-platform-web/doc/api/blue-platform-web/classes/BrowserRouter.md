[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / BrowserRouter

# Class: BrowserRouter

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

> **new BrowserRouter**(`callback`, `options?`): `BrowserRouter`

Creates an instance of `BrowserRouter`.

#### Parameters

##### callback

`RouterCallback`

The `RouterCallback` to be invoked when the route changes.
  Called with a `PathRoute` representing the current URL path.

##### options?

`RouterOptions` = `{}`

Router options, e.g. the navigation-error hook.

#### Returns

`BrowserRouter`

#### Overrides

`AbstractRouter.constructor`

## Properties

### callback

> `readonly` **callback**: `RouterCallback`

#### Overrides

`AbstractRouter.callback`

***

### destroyed

> **destroyed**: `boolean`

## Accessors

### history

#### Get Signature

> **get** **history**(): `RingBuffer`\<[`RouteTransaction`](#)\>

##### Returns

`RingBuffer`\<[`RouteTransaction`](#)\>

***

### route

#### Get Signature

> **get** **route**(): `string`

##### Returns

`string`

#### Overrides

`AbstractRouter.route`

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

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

### destroy()

> **destroy**(): `void`

Destroys the router by removing its `popstate` event listener.

#### Returns

`void`

***

### navigate()

> **navigate**(`path`): `Promise`\<`void`\>

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

### refresh()

> **refresh**(): `void`

Refreshes the current route by re-invoking the callback.

#### Returns

`void`

#### Overrides

`AbstractRouter.refresh`

***

### setRoute()

> **setRoute**(`newRoute`, `isPublic?`): `Promise`\<`void`\>

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

### use()

> **use**(`interceptorOrPatterns`, `interceptor?`, `excludePatterns?`): `void`

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
