[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / MappedRouterInterceptor

# Class: MappedRouterInterceptor

Defined in: packages/blue-router/src/router-interceptor.ts:50

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

Defined in: packages/blue-router/src/router-interceptor.ts:92

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

Defined in: packages/blue-router/src/router-interceptor.ts:55

The PathMatcher instance used for matching patterns.

#### Implementation of

`PathMatcherFilter.pathMatcher`

#### Overrides

`AsPathMatcherFilter(Null).pathMatcher`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`RouterInterceptor`](../interfaces/RouterInterceptor.md)

Defined in: packages/blue-router/src/router-interceptor.ts:62

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

Defined in: packages/blue-router/src/router-interceptor.ts:71

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

Defined in: packages/blue-router/src/router-interceptor.ts:81

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

An optional PathMatcher to use for matching. If not provided, `this.pathMatcher` is used.

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

Defined in: packages/blue-router/src/router-interceptor.ts:109

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

> **resolveRouteParams**(`route`): `Record`\<`string`, `string`\>

Defined in: packages/blue-router/src/router-interceptor.ts:138

Resolves route parameters from the given route based on the include patterns.
This method attempts to extract parameters if the route matches a named pattern.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object from which to resolve parameters.

#### Returns

`Record`\<`string`, `string`\>

An object containing resolved parameters, or `null` if no parameters are resolved or no matching named pattern is found.

#### Since

1.0.0

***

### postRoute()

> **postRoute**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-router/src/router-interceptor.ts:158

Executes the `postRoute` method of the wrapped interceptor, if it exists.
This method is called after a route has been handled.

#### Parameters

##### route

[`Route`](../interfaces/Route.md)

The `Route` object that was processed.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the `postRoute` operation is complete.

#### Since

1.0.0

#### Implementation of

[`RouterInterceptor`](../interfaces/RouterInterceptor.md).[`postRoute`](../interfaces/RouterInterceptor.md#postroute)

***

### preRoute()

> **preRoute**(`route`): `Promise`\<`boolean`\>

Defined in: packages/blue-router/src/router-interceptor.ts:169

Executes the `preRoute` method of the wrapped interceptor, if it exists.
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

[`RouterInterceptor`](../interfaces/RouterInterceptor.md).[`preRoute`](../interfaces/RouterInterceptor.md#preroute)
