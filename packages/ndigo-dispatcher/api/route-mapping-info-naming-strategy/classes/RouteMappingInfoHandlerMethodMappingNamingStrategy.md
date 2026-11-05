[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-mapping-info-naming-strategy](../README.md) / RouteMappingInfoHandlerMethodMappingNamingStrategy

# Class: RouteMappingInfoHandlerMethodMappingNamingStrategy

Default naming strategy for route mappings: prefers the mapping's explicit
`name`, and otherwise joins the handler class and method with the static
`separator`.

## Implements

- [`RouteHandlerMethodMappingNamingStrategy`](../../route-handler-method/interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)\>

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

[`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)

The handler method being named.

##### mapping

[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)

The associated route mapping metadata.

#### Returns

`string`

The mapping name.

#### Implementation of

[`RouteHandlerMethodMappingNamingStrategy`](../../route-handler-method/interfaces/RouteHandlerMethodMappingNamingStrategy.md).[`getName`](../../route-handler-method/interfaces/RouteHandlerMethodMappingNamingStrategy.md#getname)
