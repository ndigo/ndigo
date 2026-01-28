[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataHandlerAdapter

# Class: MetadataHandlerAdapter

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:111

Implementation of [AbstractHandlerMethodAdapter](AbstractHandlerMethodAdapter.md) that supports HandlerMethod\|HandlerMethods decorated with `route:mapping` metadata. This is usually applied using RouteMapping\|@RouteMapping.

## Extends

- [`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md)

## Implements

- [`Initializable`](../../../blue-factory/src/interfaces/Initializable.md)

## Constructors

### Constructor

> **new MetadataHandlerAdapter**(): `MetadataHandlerAdapter`

#### Returns

`MetadataHandlerAdapter`

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`constructor`](AbstractHandlerMethodAdapter.md#constructor)

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:64

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`applicationContext`](AbstractHandlerMethodAdapter.md#applicationcontext)

***

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:112

***

### handlers

> **handlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:113

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:115

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`[toStringTag]`](AbstractHandlerMethodAdapter.md#tostringtag)

***

### defaultArgumentResolvers

#### Get Signature

> **get** **defaultArgumentResolvers**(): [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:119

##### Returns

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

***

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:123

##### Returns

`boolean`

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`[$aware]`](AbstractHandlerMethodAdapter.md#aware)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/src/context.ts:57

#### Parameters

##### applicationContext

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`setApplicationContext`](AbstractHandlerMethodAdapter.md#setapplicationcontext)

***

### supports()

> **supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:70

#### Parameters

##### handler

`any`

#### Returns

`boolean`

#### Inherited from

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`supports`](AbstractHandlerMethodAdapter.md#supports)

***

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](ModelAndView.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:127

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`RouteHandlerMethod`

#### Returns

`Promise`\<[`ModelAndView`](ModelAndView.md)\>

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`handle`](AbstractHandlerMethodAdapter.md#handle)

***

### init()

> **init**(...`args`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:135

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Implementation of

[`Initializable`](../../../blue-factory/src/interfaces/Initializable.md).[`init`](../../../blue-factory/src/interfaces/Initializable.md#init)

***

### \_supports()

> **\_supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:178

#### Parameters

##### handler

`RouteHandlerMethod`

#### Returns

`boolean`

#### Overrides

[`AbstractHandlerMethodAdapter`](AbstractHandlerMethodAdapter.md).[`_supports`](AbstractHandlerMethodAdapter.md#_supports)
