[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataHandlerAdapter

# Class: MetadataHandlerAdapter

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:123](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-123)

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

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:67](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-67)

Application context used to discover handlers and argument resolvers.

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`applicationContext`](AbstractHandlerMethodAdapter.md#applicationcontext)

***

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:127](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-127)

Argument resolvers used to convert route values into handler method arguments.

***

### handlers

> **handlers**: `any`[]

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-132)

Cached handler descriptors discovered from application context metadata.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:134](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-134)

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`[toStringTag]`](AbstractHandlerMethodAdapter.md#tostringtag)

***

### defaultArgumentResolvers

#### Get Signature

> **get** **defaultArgumentResolvers**(): [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:143](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-143)

Built-in argument resolvers used when no custom resolver collection is present.

##### Returns

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

The default resolver chain.

***

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:152](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-152)

A symbol indicating that the value is aware.

##### Returns

`boolean`

A symbol indicating that the value is aware.

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`[$aware]`](AbstractHandlerMethodAdapter.md#aware)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/lib/context.d.ts:145

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

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-73)

Tests whether this adapter supports the given handler.

#### Parameters

##### handler

`object` \| `undefined`

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is supported.

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`supports`](AbstractHandlerMethodAdapter.md#supports)

***

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](ModelAndView.md)\>

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:163](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-163)

Execute a metadata-mapped handler method.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

[`RouteHandlerMethod`](RouteHandlerMethod.md) \| `undefined`

The resolved route handler method.

#### Returns

`Promise`\<[`ModelAndView`](ModelAndView.md)\>

The model and view produced by the handler.

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`handle`](AbstractHandlerMethodAdapter.md#handle)

***

### init()

> **init**(...`args`): `void`

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:177](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-177)

Discover handler methods and argument resolvers from the application context.

#### Parameters

##### args

...`any`[]

Reserved for framework initialization hooks.

#### Returns

`void`

#### Implementation of

`Initializable.init`

***

### \_supports()

> **\_supports**(`handler`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-handler-adapter.ts:238](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-adapter.ts#lines-238)

Metadata adapters only support [RouteHandlerMethod](RouteHandlerMethod.md) instances.

#### Parameters

##### handler

[`RouteHandlerMethod`](RouteHandlerMethod.md)

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is a route handler method.

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`_supports`](AbstractHandlerMethodAdapter.md#_supports)
