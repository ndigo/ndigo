[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-method](../README.md) / RouteHandlerMethodMappingNamingStrategy

# Interface: RouteHandlerMethodMappingNamingStrategy\<T\>

Assigns the name a handler method's mapping is registered and inspectable
under — the mapping's own name when it declares one, otherwise a name the
strategy derives from the handler and mapping metadata.

## Type Parameters

### T

`T` = `unknown`

## Methods

### getName()

> **getName**(`handlerMethod`, `mapping`): `string`

Derives the mapping name for a handler method.

#### Parameters

##### handlerMethod

[`RouteHandlerMethod`](../classes/RouteHandlerMethod.md)

The handler method being registered.

##### mapping

`T`

The handler method's mapping.

#### Returns

`string`

The mapping name.
