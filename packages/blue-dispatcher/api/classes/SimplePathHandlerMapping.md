[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / SimplePathHandlerMapping

# Class: SimplePathHandlerMapping

Map handlers from explicit path registrations.

## Extends

- [`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md)

## Constructors

### Constructor

> **new SimplePathHandlerMapping**(): `SimplePathHandlerMapping`

Create an empty explicit path mapping.

#### Returns

`SimplePathHandlerMapping`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`constructor`](AbstractPathHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[$aware]`](AbstractPathHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`applicationContext`](AbstractPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`defaultHandler`](AbstractPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`interceptors`](AbstractPathHandlerMapping.md#interceptors)

***

### mappings

> **mappings**: `Map`\<`string`, [`MaybeHandler`](../type-aliases/MaybeHandler.md)\>

Explicit path-to-handler mappings.

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`name`](AbstractPathHandlerMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`pathMatcher`](AbstractPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Handler mapped to the root path.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`rootHandler`](AbstractPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractPathHandlerMapping.md#usetrailingslashmatch)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[toStringTag]`](AbstractPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): [`RouteHandlerExecutionChain`](#) \| `null`

Resolve a route to a handler execution chain.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerExecutionChain`](#) \| `null`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`getHandler`](AbstractPathHandlerMapping.md#gethandler)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): [`RouteHandlerExecutionChain`](#) \| `null`

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerExecutionChain`](#) \| `null`

The resolved execution chain, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`lookUpHandler`](AbstractPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md) \| `null`

Check whether a route matches a path pattern.

#### Parameters

##### route

[`Route`](#)

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](RouteMatchResult.md) \| `null`

A match result, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`match`](AbstractPathHandlerMapping.md#match)

***

### registerHandlers()

> **registerHandlers**(`mappings`): `void`

Register handlers from a map, normalizing paths and handler names.

#### Parameters

##### mappings

`Map`\<`string`, [`MaybeHandler`](../type-aliases/MaybeHandler.md)\>

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setApplicationContext`](AbstractPathHandlerMapping.md#setapplicationcontext)

***

### setMappings()

> **setMappings**(`mappings`): `void`

Merge explicit path mappings into the registry.

#### Parameters

##### mappings

\{\[`path`: `string`\]: [`MaybeHandler`](../type-aliases/MaybeHandler.md); \}

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setName`](AbstractPathHandlerMapping.md#setname)
