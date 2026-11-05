[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [simple-path-handler-mapping](../README.md) / SimplePathHandlerMapping

# Class: SimplePathHandlerMapping

Map handlers from explicit path registrations.

## Extends

- [`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md)

## Constructors

### Constructor

> **new SimplePathHandlerMapping**(): `SimplePathHandlerMapping`

Create an empty explicit path mapping.

#### Returns

`SimplePathHandlerMapping`

#### Overrides

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`constructor`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`[$aware]`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`applicationContext`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`defaultHandler`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`interceptors`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#interceptors)

***

### mappings

> **mappings**: `Map`\<`string`, [`MaybeHandler`](#)\>

Explicit path-to-handler mappings.

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`name`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`pathMatcher`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Handler mapped to the root path.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`rootHandler`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`useTrailingSlashMatch`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#usetrailingslashmatch)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`[toStringTag]`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): [`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

Resolve a route to a handler execution chain.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`getHandler`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#gethandler)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): [`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

[`Route`](#)

The current route.

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

The resolved execution chain, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`lookUpHandler`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

Check whether a route matches a path pattern.

#### Parameters

##### route

[`Route`](#)

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

A match result, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`match`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#match)

***

### registerHandlers()

> **registerHandlers**(`mappings`): `void`

Register handlers from a map, normalizing paths and handler names.

#### Parameters

##### mappings

`Map`\<`string`, [`MaybeHandler`](#)\>

The path-to-handler map to register.

#### Returns

`void`

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Store the application context and register configured mappings.

#### Parameters

##### context

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Overrides

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`setApplicationContext`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#setapplicationcontext)

***

### setMappings()

> **setMappings**(`mappings`): `void`

Merge explicit path mappings into the registry.

#### Parameters

##### mappings

\{\[`path`: `string`\]: [`MaybeHandler`](#); \}

The path-to-handler map to merge.

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

[`AbstractPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md).[`setName`](../../abstract-path-handler-mapping/classes/AbstractPathHandlerMapping.md#setname)
