[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MappedHandlerInterceptor

# Class: MappedHandlerInterceptor

Intercept the execution of a handler. Called after HandlerMapping determined
an appropriate handler object, but before RouteHandlerAdapter invokes the handler.

## Extends

- `PathMatcherFilter`\<`this`\> & `Null`\<`this`\>

## Implements

- [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

## Constructors

### Constructor

> **new MappedHandlerInterceptor**(`interceptor`, `includePatterns`, `excludePatterns?`): `MappedHandlerInterceptor`

#### Parameters

##### interceptor

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

##### includePatterns

`string`[]

##### excludePatterns?

`string`[]

#### Returns

`MappedHandlerInterceptor`

#### Overrides

`AsPathMatcherFilter(Null).constructor`

## Properties

### pathMatcher

> **pathMatcher**: `PathMatcher`

The `PathMatcher` instance used for matching patterns.

#### Overrides

`AsPathMatcherFilter(Null).pathMatcher`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

##### Returns

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

## Methods

### completeHandle()

> **completeHandle**(`route`, `handler`, `error?`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

##### error?

`Error` \| `null`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`completeHandle`](../interfaces/RouteHandlerInterceptor.md#completehandle)

***

### matches()

> **matches**(`path`, `matcher?`): `boolean`

Checks if a given path matches the configured include/exclude patterns.

#### Parameters

##### path

`string`

The path to check.

##### matcher?

`PathMatcher`

An optional `PathMatcher` to use for matching. If not provided, `this.pathMatcher` is used.

#### Returns

`boolean`

`true` if the path matches the include patterns and does not match any exclude patterns, `false` otherwise.

#### Inherited from

`AsPathMatcherFilter(Null).matches`

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

##### modelAndView

[`ModelAndView`](ModelAndView.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`postHandle`](../interfaces/RouteHandlerInterceptor.md#posthandle)

***

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

`Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`preHandle`](../interfaces/RouteHandlerInterceptor.md#prehandle)

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns`): `void`

Sets the patterns to exclude. Paths matching these patterns will be filtered out.

#### Parameters

##### excludePatterns

`string`[]

An array of patterns to exclude.

#### Returns

`void`

#### Inherited from

`AsPathMatcherFilter(Null).setExcludePatterns`

***

### setIncludePatterns()

> **setIncludePatterns**(`includePatterns`): `void`

Sets the patterns to include. Paths must match at least one of these patterns to be included.
If no include patterns are set, all paths are considered included (unless excluded by `excludePatterns`).

#### Parameters

##### includePatterns

`string`[]

An array of patterns to include.

#### Returns

`void`

#### Inherited from

`AsPathMatcherFilter(Null).setIncludePatterns`
