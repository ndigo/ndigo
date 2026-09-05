[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / MappedRouterInterceptor

# Class: MappedRouterInterceptor

Defined in: [packages/blue-router/src/router-interceptor.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-51)

A `RouterInterceptor` that applies a wrapped interceptor only when the route matches specified include and exclude patterns.
It extends `AsPathMatcherFilter` to leverage path matching capabilities.

## Since

1.0.0

## Extends

- `PathMatcherFilter` & `Null`\<`this`\>

## Implements

- [`RouterInterceptor`](../interfaces/RouterInterceptor.md)
- `PathMatcherFilter`

## Constructors

### Constructor

> **new MappedRouterInterceptor**(`interceptor`, `includePatterns`, `excludePatterns?`): `MappedRouterInterceptor`

Defined in: [packages/blue-router/src/router-interceptor.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-93)

Creates an instance of `MappedRouterInterceptor`.

#### Parameters

##### interceptor

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

The `RouterInterceptor` to wrap and conditionally apply.

##### includePatterns

`string`[]

An array of patterns that define when the interceptor should be active.

##### excludePatterns?

`string`[]

An optional array of patterns that define when the interceptor should be inactive, overriding include patterns.

#### Returns

`MappedRouterInterceptor`

#### Since

1.0.0

#### Overrides

`AsPathMatcherFilter(Null).constructor`

## Properties

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: [packages/blue-router/src/router-interceptor.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-56)

The `PathMatcher` instance used for matching patterns.

#### Implementation of

`PathMatcherFilter.pathMatcher`

#### Overrides

`AsPathMatcherFilter(Null).pathMatcher`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)

Defined in: [packages/blue-router/src/router-interceptor.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-63)

Gets the underlying `RouterInterceptor` that this mapped interceptor wraps.

##### Since

1.0.0

##### Returns

[`RouterInterceptor`](../interfaces/RouterInterceptor.md)

The wrapped `RouterInterceptor` instance.

***

### excludePatterns

#### Get Signature

> **get** **excludePatterns**(): `string`[]

Defined in: [packages/blue-router/src/router-interceptor.ts:72](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-72)

Gets the array of patterns that, if matched, will prevent the interceptor from being applied.

##### Since

1.0.0

##### Returns

`string`[]

An array of exclusion patterns.

***

### includePatterns

#### Get Signature

> **get** **includePatterns**(): `string`[]

Defined in: [packages/blue-router/src/router-interceptor.ts:82](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-82)

Gets the array of patterns that, if matched, will allow the interceptor to be applied.
If no include patterns are specified, the interceptor applies to all routes (unless excluded).

##### Since

1.0.0

##### Returns

`string`[]

An array of inclusion patterns.

## Methods

### matches()

> **matches**(`path`, `matcher?`): `boolean`

Defined in: packages/blue-core/lib/path-matcher.d.ts:53

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

#### Implementation of

`PathMatcherFilter.matches`

#### Inherited from

`AsPathMatcherFilter(Null).matches`

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns`): `void`

Defined in: packages/blue-core/lib/path-matcher.d.ts:58

Sets the patterns to exclude. Paths matching these patterns will be filtered out.

#### Parameters

##### excludePatterns

`string`[]

An array of patterns to exclude.

#### Returns

`void`

#### Implementation of

`PathMatcherFilter.setExcludePatterns`

#### Inherited from

`AsPathMatcherFilter(Null).setExcludePatterns`

***

### setIncludePatterns()

> **setIncludePatterns**(`includePatterns`): `void`

Defined in: packages/blue-core/lib/path-matcher.d.ts:64

Sets the patterns to include. Paths must match at least one of these patterns to be included.
If no include patterns are set, all paths are considered included (unless excluded by `excludePatterns`).

#### Parameters

##### includePatterns

`string`[]

An array of patterns to include.

#### Returns

`void`

#### Implementation of

`PathMatcherFilter.setIncludePatterns`

#### Inherited from

`AsPathMatcherFilter(Null).setIncludePatterns`

***

### matchesRoute()

> **matchesRoute**(`route`): `boolean`

Defined in: [packages/blue-router/src/router-interceptor.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-110)

Determines if the given route matches the configured include and exclude patterns.
Exclusion patterns take precedence over inclusion patterns.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object to check.

#### Returns

`boolean`

`true` if the route matches the patterns and should be intercepted, `false` otherwise.

#### Since

1.0.0

***

### resolveRouteParams()

> **resolveRouteParams**(`route`): `Record`\<`string`, `string`\> \| `null`

Defined in: [packages/blue-router/src/router-interceptor.ts:139](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-139)

Resolves route parameters from the given route based on the include patterns.
This method attempts to extract parameters if the route matches a named pattern.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object from which to resolve parameters.

#### Returns

`Record`\<`string`, `string`\> \| `null`

An object containing resolved parameters, or `null` if no parameters are resolved or no matching named pattern is found.

#### Since

1.0.0

***

### postHandle()

> **postHandle**(`route`): `Promise`\<`void`\>

Defined in: [packages/blue-router/src/router-interceptor.ts:169](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-169)

Executes the `postHandle` method of the wrapped interceptor, if it exists.
This method is called after a route has been handled.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object that was processed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the `postHandle` operation is complete.

#### Since

1.0.0

#### Implementation of

[`RouterInterceptor`](../interfaces/RouterInterceptor.md).[`postHandle`](../interfaces/RouterInterceptor.md#posthandle)

***

### afterCompletion()

> **afterCompletion**(`route`): `Promise`\<`void`\>

Defined in: [packages/blue-router/src/router-interceptor.ts:180](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-180)

Executes the `afterCompletion` method of the wrapped interceptor, if it exists.
This method is called after the entire request processing is complete.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object that was processed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the `afterCompletion` operation is complete.

#### Since

1.0.0

#### Implementation of

[`RouterInterceptor`](../interfaces/RouterInterceptor.md).[`afterCompletion`](../interfaces/RouterInterceptor.md#aftercompletion)

***

### preHandle()

> **preHandle**(`route`): `Promise`\<`boolean`\>

Defined in: [packages/blue-router/src/router-interceptor.ts:191](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-191)

Executes the `preHandle` method of the wrapped interceptor, if it exists.
This method is called before a route is handled and can prevent further processing.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object to be processed.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` to continue processing, or `false` to stop.

#### Since

1.0.0

#### Implementation of

[`RouterInterceptor`](../interfaces/RouterInterceptor.md).[`preHandle`](../interfaces/RouterInterceptor.md#prehandle)
