[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMappingInfoHandlerMethodMappingNamingStrategy

# Class: RouteMappingInfoHandlerMethodMappingNamingStrategy

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:916](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-916)

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

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:922](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-922)

Separator used when generating fallback mapping names.

## Methods

### getName()

> **getName**(`handlerMethod`, `mapping`): `string`

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:931](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-931)

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
