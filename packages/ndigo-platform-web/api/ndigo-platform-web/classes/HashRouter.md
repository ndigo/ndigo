[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [ndigo-platform-web](../README.md) / HashRouter

# Class: HashRouter

A hash-based router implementation for browser environments that extends `AbstractRouter`.
It manages routing based on the URL hash fragment, supports route interceptors, and maintains a route history.
This class structurally conforms to the `Destroyable` shape (`destroyed` + `destroy()`) without importing the interface,
so `likeDestroyable` checks can still identify it by duck typing.

## Since

1.0.0

## Extends

- `AbstractRouter`

## Constructors

### Constructor

> **new HashRouter**(`callback`, `options?`): `HashRouter`

Creates an instance of `HashRouter`.

#### Parameters

##### callback

`RouterCallback`

The `RouterCallback` to be invoked when the route changes.

##### options?

`RouterOptions` = `{}`

Router options, e.g. the navigation-error hook.

#### Returns

`HashRouter`

#### Since

1.0.0

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

Indicates whether the router has been destroyed and its event listeners removed.

#### Since

1.0.0

## Accessors

### history

#### Get Signature

> **get** **history**(): [`RouteHistory`](#)

Gets the `RingBuffer` instance that stores the route history.

##### Since

1.0.0

##### Returns

[`RouteHistory`](#)

The route history buffer.

***

### route

#### Get Signature

> **get** **route**(): `string`

Gets the current route as a string.

##### Since

1.0.0

##### Returns

`string`

The string representation of the current route, or an empty string if no route is set.

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

Destroys the router by removing its `hashchange` event listener.
Once destroyed, the router will no longer respond to URL hash changes.

#### Returns

`void`

#### Since

1.0.0

***

### navigate()

> **navigate**(`path`): `Promise`\<`void`\>

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

### refresh()

> **refresh**(): `void`

Refreshes the current route by re-invoking the router's callback with the current route.
This can be useful to re-apply routing logic or update UI components without a full navigation.

#### Returns

`void`

#### Since

1.0.0

#### Overrides

`AbstractRouter.refresh`

***

### setRoute()

> **setRoute**(`newRoute`, `isPublic?`): `Promise`\<`void`\>

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
