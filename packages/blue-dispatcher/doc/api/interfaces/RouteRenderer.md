[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteRenderer

# Interface: RouteRenderer

Interface for rendering a [ModelAndView](../classes/ModelAndView.md).

## Methods

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Renders the given [ModelAndView](../classes/ModelAndView.md) for the specified route.

#### Parameters

##### mv

[`ModelAndView`](../classes/ModelAndView.md)

The [ModelAndView](../classes/ModelAndView.md) to render.

##### route

[`Route`](#)

The route associated with the [ModelAndView](../classes/ModelAndView.md).

#### Returns

`Promise`\<`void`\>
