[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMethodAdapter

# Abstract Class: AbstractHandlerMethodAdapter

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:60

## Extends

- [`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md) & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Extended by

- [`MetadataHandlerAdapter`](MetadataHandlerAdapter.md)

## Implements

- [`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)

## Constructors

### Constructor

> **new AbstractHandlerMethodAdapter**(): `AbstractHandlerMethodAdapter`

#### Returns

`AbstractHandlerMethodAdapter`

#### Inherited from

`AsApplicationContextAware(Null).constructor`

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:64

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:66

##### Returns

`string`

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

`AsApplicationContextAware(Null).setApplicationContext`

***

### supports()

> **supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:70

#### Parameters

##### handler

`any`

#### Returns

`boolean`

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`supports`](../interfaces/RouteHandlerAdapter.md#supports)

***

### handle()

> `abstract` **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](ModelAndView.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:74

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`RouteHandlerMethod`

#### Returns

`Promise`\<[`ModelAndView`](ModelAndView.md)\>

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`handle`](../interfaces/RouteHandlerAdapter.md#handle)

***

### \_supports()

> `abstract` `protected` **\_supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:75

#### Parameters

##### handler

`RouteHandlerMethod`

#### Returns

`boolean`
