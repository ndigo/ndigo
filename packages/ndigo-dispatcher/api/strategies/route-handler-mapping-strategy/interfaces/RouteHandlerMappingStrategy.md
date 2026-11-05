[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/route-handler-mapping-strategy](../README.md) / RouteHandlerMappingStrategy

# Interface: RouteHandlerMappingStrategy

Strategy mixin contract for handler mappings: exposes the ordered mappings a
route is resolved against, and an initializer that installs them from the
application context.

## Properties

### handlerMappings

> **handlerMappings**: [`RouteHandlerMapping`](../../../abstract-handler-mapping/interfaces/RouteHandlerMapping.md)[]

## Methods

### getHandler()

> **getHandler**(`route`): [`default`](../../../route-handler-execution-chain/classes/default.md)

#### Parameters

##### route

[`Route`](#)

#### Returns

[`default`](../../../route-handler-execution-chain/classes/default.md)

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`
