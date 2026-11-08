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

The ordered adapters consulted for a handler.

## Methods

### getHandlerAdapter()

> **getHandlerAdapter**(`handler`): [`RouteHandlerAdapter`](../../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

Finds the adapter that supports a handler.

#### Parameters

##### handler

`object` \| `undefined`

The resolved handler.

#### Returns

[`RouteHandlerAdapter`](../../../route-handler-adapter/interfaces/RouteHandlerAdapter.md)

The supporting adapter.

***

### initHandlerAdapters()

> **initHandlerAdapters**(`context`): `void`

Installs the handler adapters from the context or the defaults.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
