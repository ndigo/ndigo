[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / RouteMappingInfoHandlerMethodMappingNamingStrategy

# Class: RouteMappingInfoHandlerMethodMappingNamingStrategy

## Implements

- [`RouteHandlerMethodMappingNamingStrategy`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

## Constructors

### Constructor

> **new RouteMappingInfoHandlerMethodMappingNamingStrategy**(): `RouteMappingInfoHandlerMethodMappingNamingStrategy`

#### Returns

`RouteMappingInfoHandlerMethodMappingNamingStrategy`

## Properties

### separator

> `readonly` `static` **separator**: `string`

Separator used when generating fallback mapping names.

## Methods

### getName()

> **getName**(`handlerMethod`, `mapping`): `string`

Create a mapping name from the handler method and mapping metadata.

#### Parameters

##### handlerMethod

[`RouteHandlerMethod`](RouteHandlerMethod.md)

The handler method being named.

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The associated route mapping metadata.

#### Returns

`string`

The mapping name.

#### Implementation of

[`RouteHandlerMethodMappingNamingStrategy`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md).[`getName`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md#getname)
