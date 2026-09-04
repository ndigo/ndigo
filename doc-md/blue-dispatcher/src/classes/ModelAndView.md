[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ModelAndView

# Class: ModelAndView

Defined in: packages/blue-dispatcher/src/model-and-view.ts:12

Holds a view plus its optional model data.

## Constructors

### Constructor

> **new ModelAndView**(`view`, `model?`): `ModelAndView`

Defined in: packages/blue-dispatcher/src/model-and-view.ts:45

Create a model and view pair.

#### Parameters

##### view

`string` \| `View`

The view name or view instance.

##### model?

`Model`\<`any`\> \| `null`

Optional model data to expose to the view.

#### Returns

`ModelAndView`

## Properties

### model

> **model**: `Model`\<`any`\> \| `null`

Defined in: packages/blue-dispatcher/src/model-and-view.ts:16

Model data supplied to the view.

***

### viewName

> **viewName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/model-and-view.ts:21

Resolved view name, when known.

***

### view

> **view**: `View` \| `null`

Defined in: packages/blue-dispatcher/src/model-and-view.ts:26

Resolved view instance, when known.

## Accessors

### hasView

#### Get Signature

> **get** **hasView**(): `boolean`

Defined in: packages/blue-dispatcher/src/model-and-view.ts:31

Whether this instance has either a view name or view object.

##### Returns

`boolean`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/model-and-view.ts:35

##### Returns

`string`
