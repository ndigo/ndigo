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

The ordered mappings a route is resolved against.

## Methods

### getHandler()

> **getHandler**(`route`): [`default`](../../../route-handler-execution-chain/classes/default.md)

Resolves a route to its execution chain.

#### Parameters

##### route

[`Route`](#)

The route to resolve.

#### Returns

[`default`](../../../route-handler-execution-chain/classes/default.md)

The execution chain for the route.

***

### initHandlerMappings()

> **initHandlerMappings**(`context`): `void`

Installs the handler mappings from the context or the defaults.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
