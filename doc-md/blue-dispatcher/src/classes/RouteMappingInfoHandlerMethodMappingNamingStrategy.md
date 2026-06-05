[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMappingInfoHandlerMethodMappingNamingStrategy

# Class: RouteMappingInfoHandlerMethodMappingNamingStrategy

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:884

## Implements

- `RouteHandlerMethodMappingNamingStrategy`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

## Constructors

### Constructor

> **new RouteMappingInfoHandlerMethodMappingNamingStrategy**(): `RouteMappingInfoHandlerMethodMappingNamingStrategy`

#### Returns

`RouteMappingInfoHandlerMethodMappingNamingStrategy`

## Properties

### separator

> `readonly` `static` **separator**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:890

Separator used when generating fallback mapping names.

## Methods

### getName()

> **getName**(`handlerMethod`, `mapping`): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:899

Create a mapping name from the handler method and mapping metadata.

#### Parameters

##### handlerMethod

`RouteHandlerMethod`

The handler method being named.

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The associated route mapping metadata.

#### Returns

`string`

The mapping name.

#### Implementation of

`RouteHandlerMethodMappingNamingStrategy.getName`
