[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / WebComponentViewEngine

# Class: WebComponentViewEngine

Defined in: packages/blue-view-webcomponent/src/engine.ts:213

View engine that renders BlueJS views as custom elements.

## Implements

- `ViewEngine`

## Constructors

### Constructor

> **new WebComponentViewEngine**(): `WebComponentViewEngine`

#### Returns

`WebComponentViewEngine`

## Methods

### render()

> **render**(`view`, `model`, `target`, `route`): `Promise`\<`void`\>

Defined in: packages/blue-view-webcomponent/src/engine.ts:224

Renders a web component view into the target, reusing an existing matching element when possible.

#### Parameters

##### view

`View`

The view to render.

##### model

`any`

The view model passed to the component.

##### target

`ViewTarget`

The destination for rendered output.

##### route

`Route`

The active route for the render pass.

#### Returns

`Promise`\<`void`\>

A promise that resolves when rendering completes.

#### Throws

When `view` is not a `WebComponentView`.

#### Implementation of

`ViewEngine.render`
