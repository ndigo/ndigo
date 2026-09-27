[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / DefaultRouteToViewNameTranslator

# Class: DefaultRouteToViewNameTranslator

Translates a route into a view name.

## Implements

- [`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md)

## Constructors

### Constructor

> **new DefaultRouteToViewNameTranslator**(): `DefaultRouteToViewNameTranslator`

Create a translator with empty prefix and suffix.

#### Returns

`DefaultRouteToViewNameTranslator`

## Properties

### prefix

> **prefix**: `string`

Prefix added to every translated view name.

***

### separator

> **separator**: `string`

Separator used when rewriting the route path.

***

### suffix

> **suffix**: `string`

Suffix added to every translated view name.

## Methods

### getViewName()

> **getViewName**(`route`): `string`

Translate a route path into a view name.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The translated view name.

#### Implementation of

[`RouteToViewNameTranslator`](../interfaces/RouteToViewNameTranslator.md).[`getViewName`](../interfaces/RouteToViewNameTranslator.md#getviewname)
