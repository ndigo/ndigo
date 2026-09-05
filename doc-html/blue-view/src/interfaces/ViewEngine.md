[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ViewEngine

# Interface: ViewEngine

Defined in: [packages/blue-view/src/view-engine.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-engine.ts#lines-14)

Translates a view and model into a rendered output for a target.

Engines own the rendering format; targets own the destination.

## Methods

### render()

> **render**(`view`, `model`, `target`, `route`): `Promise`\<`void`\>

Defined in: [packages/blue-view/src/view-engine.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-engine.ts#lines-24)

Renders the view and commits the output to the target.

#### Parameters

##### view

[`View`](View.md)

The view to render.

##### model

`any`

The data model supplied to the view.

##### target

[`ViewTarget`](ViewTarget.md)

The destination that receives the rendered output.

##### route

[`Route`](#)

The current route used during rendering.

#### Returns

`Promise`\<`void`\>

A promise that resolves when rendering completes.
