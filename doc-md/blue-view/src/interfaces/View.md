[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / View

# Interface: View

Defined in: packages/blue-view/src/view.ts:20

View for a web interaction. Implementations are responsible for rendering content, and exposing the model. A single view exposes multiple model attributes.

View implementations may differ widely. This interface is designed to avoid restricting the range of possible implementations.

They are likely to be instantiated by a ViewResolver\|\`ViewResolver\` .

## Properties

### mediaType

> **mediaType**: `MediaType`

Defined in: packages/blue-view/src/view.ts:24

The media type of the view.

***

### destroyed?

> `optional` **destroyed?**: `boolean`

Defined in: packages/blue-view/src/view.ts:28

Indicates if the view has been destroyed.

## Methods

### destroy()?

> `optional` **destroy**(): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view.ts:32

Destroys the view, releasing any resources.

#### Returns

`void` \| `Promise`\<`void`\>

***

### render()

> **render**(`model`, `request`, `target?`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view.ts:39

Render the view given the specified model.

#### Parameters

##### model

`any`

The data model.

##### request

`any`

The current request.

##### target?

[`ViewTarget`](ViewTarget.md)

The optional view target.

#### Returns

`void` \| `Promise`\<`void`\>
