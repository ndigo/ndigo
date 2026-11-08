[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-adapter](../README.md) / MetadataHandlerAdapter

# Class: MetadataHandlerAdapter

Implementation of [AbstractHandlerMethodAdapter](AbstractHandlerMethodAdapter.md) that supports `HandlerMethods` decorated with `route:mapping` metadata. This is usually applied using `@RouteMapping`.

## Extends

- [`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md)

## Implements

- [`Initializable`](#)

## Constructors

### Constructor

> **new MetadataHandlerAdapter**(): `MetadataHandlerAdapter`

#### Returns

`MetadataHandlerAdapter`

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`constructor`](AbstractHandlerMethodAdapter.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext` \| `null`

Application context used to discover handlers and argument resolvers.

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`applicationContext`](AbstractHandlerMethodAdapter.md#applicationcontext)

***

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../../argument-resolver/interfaces/HandlerMethodArgumentResolver.md)[]

Argument resolvers used to convert route values into handler method arguments.

***

### handlers

> **handlers**: [`RouteMappingConfiguration`](../../route-mapping/type-aliases/RouteMappingConfiguration.md)[]

Cached handler descriptors discovered from application context metadata.

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

A symbol indicating that the value is aware.

##### Returns

`boolean`

A symbol indicating that the value is aware.

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`[$aware]`](AbstractHandlerMethodAdapter.md#aware)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`[toStringTag]`](AbstractHandlerMethodAdapter.md#tostringtag)

***

### defaultArgumentResolvers

#### Get Signature

> **get** **defaultArgumentResolvers**(): [`HandlerMethodArgumentResolver`](../../argument-resolver/interfaces/HandlerMethodArgumentResolver.md)[]

Built-in argument resolvers used when no custom resolver collection is present.

##### Returns

[`HandlerMethodArgumentResolver`](../../argument-resolver/interfaces/HandlerMethodArgumentResolver.md)[]

The default resolver chain.

## Methods

### \_supports()

> **\_supports**(`handler`): `boolean`

Metadata adapters only support [RouteHandlerMethod](../../route-handler-method/classes/RouteHandlerMethod.md) instances.

#### Parameters

##### handler

[`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is a route handler method.

#### Overrides

`AbstractHandlerMethodAdapter._supports`

***

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)\>

Execute a metadata-mapped handler method.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

[`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md) \| `undefined`

The resolved route handler method.

#### Returns

`Promise`\<[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)\>

The model and view produced by the handler.

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`handle`](AbstractHandlerMethodAdapter.md#handle)

***

### init()

> **init**(...`args`): `void`

Discover handler methods and argument resolvers from the application context.

#### Parameters

##### args

...`unknown`[]

Reserved for framework initialization hooks.

#### Returns

`void`

#### Implementation of

`Initializable.init`

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`setApplicationContext`](AbstractHandlerMethodAdapter.md#setapplicationcontext)

***

### supports()

> **supports**(`handler`): `boolean`

Whether this adapter can handle the given handler.

#### Parameters

##### handler

`object` \| `undefined`

The resolved handler.

#### Returns

`boolean`

`true` when the adapter supports it.

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`supports`](AbstractHandlerMethodAdapter.md#supports)
