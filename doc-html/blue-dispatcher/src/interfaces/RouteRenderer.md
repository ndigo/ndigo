[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteRenderer

# Interface: RouteRenderer

Defined in: [packages/blue-dispatcher/src/dispatcher.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/dispatcher.ts#lines-37)

Interface for rendering a [ModelAndView](../classes/ModelAndView.md).

## Methods

### render()

> **render**(`mv`, `route`): `Promise`\<`void`\>

Defined in: [packages/blue-dispatcher/src/dispatcher.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/dispatcher.ts#lines-43)

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
