[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-interceptor](../README.md) / MappedHandlerInterceptor

# Class: MappedHandlerInterceptor

Workflow interface that allows for customized handler execution chains.
Applications can register any number of existing or custom interceptors
for certain groups of handlers, to add common preprocessing behavior
without needing to modify each handler implementation.

A `RouteHandlerInterceptor` gets called before the appropriate `RouteHandlerAdapter`
triggers the execution of the handler itself. This mechanism can be used
for a large field of preprocessing aspects, e.g. for authorization checks,
or common handler behavior like locale or theme changes. Its main purpose
is to allow for factoring out repetitive handler code.

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

The matcher used to filter requests by path.

#### Overrides

`AsPathMatcherFilter(Null).pathMatcher`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

The wrapped interceptor.

##### Returns

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

## Methods

### completeHandle()

> **completeHandle**(`route`, `handler`, `error?`): `Promise`\<`void`\>

Delegates the completion callback to the wrapped interceptor.

#### Parameters

##### route

[`Route`](#)

The completed route.

##### handler

`object` \| `undefined`

The handler instance, when known.

##### error?

`Error` \| `null` = `null`

The error raised during handling, if any.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the wrapped callback completes.

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

Delegates the post-handle callback to the wrapped interceptor.

#### Parameters

##### route

[`Route`](#)

The resolved route.

##### handler

`object` \| `undefined`

The handler instance, when known.

##### modelAndView

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

The handler's result.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the wrapped callback completes.

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`postHandle`](../interfaces/RouteHandlerInterceptor.md#posthandle)

***

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

Delegates the pre-handle callback to the wrapped interceptor.

#### Parameters

##### route

[`Route`](#)

The resolved route.

##### handler

`object` \| `undefined`

The handler instance, when known.

#### Returns

`Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

The wrapped interceptor's outcome.

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
