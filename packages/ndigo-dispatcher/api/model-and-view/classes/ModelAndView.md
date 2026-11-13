[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [model-and-view](../README.md) / ModelAndView

# Class: ModelAndView

Holds a view plus its optional model data.

## Constructors

### Constructor

> **new ModelAndView**(`view`, `model?`, `options?`): `ModelAndView`

Create a model and view pair.

#### Parameters

##### view

`string` \| [`View`](#)

The view name or view instance.

##### model?

[`Model`](#)\<`unknown`\> \| `null` = `null`

Optional model data to expose to the view.

##### options?

[`ModelAndViewOptions`](../interfaces/ModelAndViewOptions.md) = `{}`

Optional placement settings ([ModelAndViewOptions.viewTarget](../interfaces/ModelAndViewOptions.md#viewtarget)).

#### Returns

`ModelAndView`

## Properties

### model

> **model**: [`Model`](#)\<`unknown`\> \| `null`

Model data supplied to the view.

***

### view

> **view**: [`View`](#) \| `null`

Resolved view instance, when known.

***

### viewName

> **viewName**: `string` \| `null` = `null`

Resolved view name, when known.

***

### viewTarget?

> `optional` **viewTarget?**: [`ViewTarget`](#)

Explicit destination for this result, when the handler supplied one.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### hasView

#### Get Signature

> **get** **hasView**(): `boolean`

Whether this instance has either a view name or view object.

##### Returns

`boolean`
