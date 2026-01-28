[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ControllerHandlerAdapter

# Class: ControllerHandlerAdapter

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:92

## Implements

- [`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)

## Constructors

### Constructor

> **new ControllerHandlerAdapter**(): `ControllerHandlerAdapter`

#### Returns

`ControllerHandlerAdapter`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:93

##### Returns

`string`

## Methods

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](ModelAndView.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:97

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`any`

#### Returns

`Promise`\<[`ModelAndView`](ModelAndView.md)\>

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`handle`](../interfaces/RouteHandlerAdapter.md#handle)

***

### supports()

> **supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:101

#### Parameters

##### handler

`any`

#### Returns

`boolean`

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`supports`](../interfaces/RouteHandlerAdapter.md#supports)
