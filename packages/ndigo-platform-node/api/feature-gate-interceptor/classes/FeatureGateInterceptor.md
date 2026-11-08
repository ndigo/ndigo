[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [feature-gate-interceptor](../README.md) / FeatureGateInterceptor

# Class: FeatureGateInterceptor

Enforces `@whenFeature` gates (AD-82): off flag → **404** problem
document (`urn:ndigo:not-found`), written before the denial finalizer so
the body survives.

## Implements

- [`RouteHandlerInterceptor`](#)
- `ApplicationContextAware`

## Constructors

### Constructor

> **new FeatureGateInterceptor**(`options?`): `FeatureGateInterceptor`

#### Parameters

##### options?

[`FeatureGateInterceptorOptions`](../interfaces/FeatureGateInterceptorOptions.md) = `{}`

Optional evaluator/resolver overrides; omit both to
  resolve the beans from the application context.

#### Returns

`FeatureGateInterceptor`

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Marks the value as aware so the factory's aware injection calls
[setApplicationContext](#setapplicationcontext) when the entry registers (the
`HTTPServer` precedent).

##### Returns

`boolean`

#### Implementation of

`ApplicationContextAware.[$aware]`

## Methods

### completeHandle()

> **completeHandle**(`_route`, `_handler`, `_error`): `Promise`\<`void`\>

No-op completion hook.

#### Parameters

##### \_route

[`Route`](#)

The dispatched route.

##### \_handler

`object` \| `undefined`

The handler that ran.

##### \_error

`Error` \| `null`

The error raised, if any.

#### Returns

`Promise`\<`void`\>

A promise that resolves immediately.

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### postHandle()

> **postHandle**(`_route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

No-op post-handle hook.

#### Parameters

##### \_route

[`Route`](#)

The dispatched route.

##### \_handler

`object` \| `undefined`

The handler that ran.

##### \_modelAndView

[`ModelAndView`](#)

The produced model and view.

#### Returns

`Promise`\<`void`\>

A promise that resolves immediately.

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Rejects requests whose feature flag is disabled.

#### Parameters

##### route

[`Route`](#)

The route being dispatched.

##### handler

`object` \| `undefined`

The route handler carrying `@whenFeature` metadata.

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

Whether to proceed, or a 404 denial.

#### Implementation of

`RouteHandlerInterceptor.preHandle`

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Injected by the aware processor when the interceptor entry registers.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`
