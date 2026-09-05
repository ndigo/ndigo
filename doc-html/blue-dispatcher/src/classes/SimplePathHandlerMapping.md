[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / SimplePathHandlerMapping

# Class: SimplePathHandlerMapping

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-18)

Map handlers from explicit path registrations.

## Extends

- [`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md)

## Constructors

### Constructor

> **new SimplePathHandlerMapping**(): `SimplePathHandlerMapping`

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-31)

Create an empty explicit path mapping.

#### Returns

`SimplePathHandlerMapping`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`constructor`](AbstractPathHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-60)

Application context used to resolve named handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`applicationContext`](AbstractPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-65)

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`defaultHandler`](AbstractPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-70)

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`interceptors`](AbstractPathHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-75)

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`pathMatcher`](AbstractPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Defined in: [packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-path-handler-mapping.ts#lines-20)

Handler mapped to the root path.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`rootHandler`](AbstractPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Defined in: [packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-path-handler-mapping.ts#lines-25)

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractPathHandlerMapping.md#usetrailingslashmatch)

***

### mappings

> **mappings**: `Map`\<`string`, [`MaybeHandler`](../type-aliases/MaybeHandler.md)\>

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-22)

Explicit path-to-handler mappings.

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[$aware]`](AbstractPathHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`name`](AbstractPathHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-24)

##### Returns

`string`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[toStringTag]`](AbstractPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain` \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:117](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-117)

Resolve a route to a handler execution chain.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`getHandler`](AbstractPathHandlerMapping.md#gethandler)

***

### \_getHandlerExecutionChain()

> `protected` **\_getHandlerExecutionChain**(`handler`, `route`): `RouteHandlerExecutionChain`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-142)

Build an execution chain for a resolved handler and route.

#### Parameters

##### handler

`any`

The resolved handler or existing execution chain.

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain`

The execution chain to invoke.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractPathHandlerMapping.md#_gethandlerexecutionchain)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): `RouteHandlerExecutionChain` \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-path-handler-mapping.ts#lines-46)

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The resolved execution chain, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`lookUpHandler`](AbstractPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md) \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:107](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-path-handler-mapping.ts#lines-107)

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

### \_getHandler()

> `protected` **\_getHandler**(`route`): `RouteHandlerExecutionChain` \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:127](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-path-handler-mapping.ts#lines-127)

Resolve the most appropriate handler for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_getHandler`](AbstractPathHandlerMapping.md#_gethandler)

***

### \_registerHandler()

> `protected` **\_registerHandler**(`path`, `handler`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:154](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-path-handler-mapping.ts#lines-154)

Register a handler against one or more paths.

#### Parameters

##### path

`string` \| `string`[]

One path or many paths to register.

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

#### Returns

`void`

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_registerHandler`](AbstractPathHandlerMapping.md#_registerhandler)

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-41)

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

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-52)

Merge explicit path mappings into the registry.

#### Parameters

##### mappings

The path-to-handler map to merge.

#### Returns

`void`

***

### registerHandlers()

> **registerHandlers**(`mappings`): `void`

Defined in: [packages/blue-dispatcher/src/simple-path-handler-mapping.ts:61](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/simple-path-handler-mapping.ts#lines-61)

Register handlers from a map, normalizing paths and handler names.

#### Parameters

##### mappings

`Map`\<`string`, [`MaybeHandler`](../type-aliases/MaybeHandler.md)\>

The path-to-handler map to register.

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/lib/aware.d.ts:36

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setName`](AbstractPathHandlerMapping.md#setname)
