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

The translator that derives a view name from a route.

## Methods

### getDefaultViewName()

> **getDefaultViewName**(`route`): `string`

Derives the default view name for a route.

#### Parameters

##### route

[`Route`](#)

The route to translate.

#### Returns

`string`

The default view name.

***

### initRouteToViewNameTranslator()

> **initRouteToViewNameTranslator**(`context`): `void`

Installs the view-name translator.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
