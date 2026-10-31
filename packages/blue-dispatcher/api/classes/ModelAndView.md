[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / ModelAndView

# Class: ModelAndView

Holds a view plus its optional model data.

## Constructors

### Constructor

> **new ModelAndView**(`view`, `model?`): `ModelAndView`

Create a model and view pair.

#### Parameters

##### view

`string` \| [`View`](#)

The view name or view instance.

##### model?

[`Model`](#)\<`unknown`\> \| `null`

Optional model data to expose to the view.

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

> **viewName**: `string` \| `null`

Resolved view name, when known.

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
