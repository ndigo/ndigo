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

#### Parameters

##### \_route

[`Route`](#)

##### \_handler

`object` \| `undefined`

##### \_error

`Error` \| `null`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`RouteHandlerInterceptor.completeHandle`

***

### postHandle()

> **postHandle**(`_route`, `_handler`, `_modelAndView`): `Promise`\<`void`\>

#### Parameters

##### \_route

[`Route`](#)

##### \_handler

`object` \| `undefined`

##### \_modelAndView

[`ModelAndView`](#)

#### Returns

`Promise`\<`void`\>

#### Implementation of

`RouteHandlerInterceptor.postHandle`

***

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

`Promise`\<`boolean` \| [`InterceptorDenial`](#)\>

#### Implementation of

`RouteHandlerInterceptor.preHandle`

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Injected by the aware processor when the interceptor entry registers.

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`
