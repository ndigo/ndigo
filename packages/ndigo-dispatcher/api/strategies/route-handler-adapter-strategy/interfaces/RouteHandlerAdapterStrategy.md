[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/route-handler-adapter-strategy](../README.md) / RouteHandlerAdapterStrategy

# Interface: RouteHandlerAdapterStrategy

Strategy mixin contract for handler adapters: exposes the ordered adapters
that turn a matched handler into a response, and an initializer that installs
them from the application context.

## Properties

### handlerAdapters

> **handlerAdapters**: [`RouteHandlerAdapter`](../../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)[]

## Methods

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): [`RouteHandlerAdapter`](../../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

#### Parameters

##### handler

`object` \| `undefined`

#### Returns

[`RouteHandlerAdapter`](../../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

***

### initHandlerAdapters()

> **initHandlerAdapters**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`
