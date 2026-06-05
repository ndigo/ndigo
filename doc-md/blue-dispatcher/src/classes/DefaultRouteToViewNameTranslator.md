[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / DefaultRouteToViewNameTranslator

# Class: DefaultRouteToViewNameTranslator

Defined in: packages/blue-dispatcher/src/route-to-view-name-translator.ts:26

## Implements

module:router.RouteToViewNameTranslator

## Implements

- [`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md)

## Constructors

### Constructor

> **new DefaultRouteToViewNameTranslator**(): `DefaultRouteToViewNameTranslator`

Defined in: packages/blue-dispatcher/src/route-to-view-name-translator.ts:45

Create a translator with empty prefix and suffix.

#### Returns

`DefaultRouteToViewNameTranslator`

## Properties

### prefix

> **prefix**: `string`

Defined in: packages/blue-dispatcher/src/route-to-view-name-translator.ts:30

Prefix added to every translated view name.

***

### separator

> **separator**: `string`

Defined in: packages/blue-dispatcher/src/route-to-view-name-translator.ts:35

Separator used when rewriting the route path.

***

### suffix

> **suffix**: `string`

Defined in: packages/blue-dispatcher/src/route-to-view-name-translator.ts:40

Suffix added to every translated view name.

## Methods

### getViewName()

> **getViewName**(`route`): `string`

Defined in: packages/blue-dispatcher/src/route-to-view-name-translator.ts:72

Translate a route path into a view name.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`string`

The translated view name.

#### Implementation of

[`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md).[`getViewName`](../interfaces/RouteToViewNameTranslator.md#getviewname)
