[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / View

# Interface: View

View for a web interaction. Implementations are responsible for rendering content, and exposing the model. A single view exposes multiple model attributes.

View implementations may differ widely. This interface is designed to avoid restricting the range of possible implementations.

They are likely to be instantiated by a `ViewResolver` .

## Properties

### destroyed?

> `optional` **destroyed?**: `boolean`

Indicates if the view has been destroyed.

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

## Methods

### destroy()?

> `optional` **destroy**(): `void` \| `Promise`\<`void`\>

Destroys the view, releasing any resources.

#### Returns

`void` \| `Promise`\<`void`\>

***

### render()

> **render**(`model`, `request`, `target?`): `void` \| `Promise`\<`void`\>

Render the view given the specified model.

#### Parameters

##### model

`unknown`

The data model.

##### request

`unknown`

The current request.

##### target?

[`ViewTarget`](ViewTarget.md)

The optional view target.

#### Returns

`void` \| `Promise`\<`void`\>
