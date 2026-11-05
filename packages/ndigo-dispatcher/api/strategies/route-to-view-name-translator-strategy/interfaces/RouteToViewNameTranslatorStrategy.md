[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/route-to-view-name-translator-strategy](../README.md) / RouteToViewNameTranslatorStrategy

# Interface: RouteToViewNameTranslatorStrategy

Strategy mixin contract for view-name translation: exposes the translator
that derives a view name from a route when a handler returns none, and an
initializer that installs it from the application context.

## Properties

### routeToViewNameTranslator

> **routeToViewNameTranslator**: [`RouteToViewNameTranslator`](../../../route-to-view-name-translator/interfaces/RouteToViewNameTranslator.md)

## Methods

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

#### Parameters

##### route

[`Route`](#)

#### Returns

`string`

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`
