[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / ComponentAndView

# Class: ComponentAndView

Defined in: [packages/blue-domain/src/component-and-view.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component-and-view.ts#lines-13)

Couples a domain component with a dispatcher model-and-view instance.

## Extends

- [`ModelAndView`](#)

## Constructors

### Constructor

> **new ComponentAndView**(`view`, `model?`): `ComponentAndView`

Defined in: packages/blue-dispatcher/lib/model-and-view.d.ts:35

Create a model and view pair.

#### Parameters

##### view

`string` \| [`View`](#)

The view name or view instance.

##### model?

`Model`\<`any`\> \| `null`

Optional model data to expose to the view.

#### Returns

`ComponentAndView`

#### Inherited from

`ModelAndView.constructor`

## Properties

### model

> **model**: `Model`\<`any`\> \| `null`

Defined in: packages/blue-dispatcher/lib/model-and-view.d.ts:15

Model data supplied to the view.

#### Inherited from

`ModelAndView.model`

***

### view

> **view**: [`View`](#) \| `null`

Defined in: packages/blue-dispatcher/lib/model-and-view.d.ts:23

Resolved view instance, when known.

#### Inherited from

`ModelAndView.view`

***

### viewName

> **viewName**: `string`

Defined in: [packages/blue-domain/src/component-and-view.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component-and-view.ts#lines-14)

Resolved view name, when known.

#### Overrides

`ModelAndView.viewName`

***

### component

> **component**: [`DomainComponent`](../interfaces/DomainComponent.md)

Defined in: [packages/blue-domain/src/component-and-view.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component-and-view.ts#lines-23)

Domain component associated with the current view model.

## Accessors

### hasView

#### Get Signature

> **get** **hasView**(): `boolean`

Defined in: packages/blue-dispatcher/lib/model-and-view.d.ts:27

Whether this instance has either a view name or view object.

##### Returns

`boolean`

#### Inherited from

`ModelAndView.hasView`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-domain/src/component-and-view.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component-and-view.ts#lines-16)

##### Returns

`string`

#### Overrides

`ModelAndView.[toStringTag]`
