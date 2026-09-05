[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractView

# Abstract Class: AbstractView

Defined in: [packages/blue-view/src/view.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-46)

Abstract base class for [\`View\`](../interfaces/View.md) implementations. Subclasses need to implement the actual rendering.

## Extends

- `NameAware` & `ApplicationContextAware` & `Null`\<`this`\>

## Extended by

- [`AbstractPathBasedView`](AbstractPathBasedView.md)

## Implements

- `Serializable`
- [`View`](../interfaces/View.md)

## Constructors

### Constructor

> **new AbstractView**(): `AbstractView`

Defined in: [packages/blue-view/src/view.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-68)

#### Returns

`AbstractView`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### destroyed

> **destroyed**: `boolean`

Defined in: [packages/blue-view/src/view.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-50)

Indicates if the view has been destroyed.

#### Implementation of

[`View`](../interfaces/View.md).[`destroyed`](../interfaces/View.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Defined in: [packages/blue-view/src/view.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-54)

The media type of the view.

#### Implementation of

[`View`](../interfaces/View.md).[`mediaType`](../interfaces/View.md#mediatype)

***

### name

> **name**: `string`

Defined in: [packages/blue-view/src/view.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-58)

The name of the view.

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-view/src/view.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-64)

Returns the string tag for this view.

##### Returns

`string`

The string tag.

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/lib/context.d.ts:145

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/lib/aware.d.ts:36

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).setName`

***

### destroy()

> **destroy**(): `void`

Defined in: [packages/blue-view/src/view.ts:77](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-77)

Destroys the view, releasing any resources.

#### Returns

`void`

#### Implementation of

[`View`](../interfaces/View.md).[`destroy`](../interfaces/View.md#destroy)

***

### render()

> **render**(`model`, `request`, `target?`): `Promise`\<`void`\>

Defined in: [packages/blue-view/src/view.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-91)

Render the view given the specified model.

#### Parameters

##### model

`any`

The data model.

##### request

`any`

The current request.

##### target?

[`ViewTarget`](../interfaces/ViewTarget.md)

The optional view target.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`View`](../interfaces/View.md).[`render`](../interfaces/View.md#render)

***

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: [packages/blue-view/src/view.ts:104](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-104)

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-view/src/view.ts:115](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-115)

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Implementation of

`Serializable.toString`

***

### \_createViewModel()

> `protected` **\_createViewModel**(`model`, `request`): `any`

Defined in: [packages/blue-view/src/view.ts:126](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-126)

Creates the view model from the given model and request.

#### Parameters

##### model

`any`

The data model.

##### request

`any`

The current request.

#### Returns

`any`

The created view model.

***

### \_renderView()

> `abstract` `protected` **\_renderView**(`viewModel`, `request`, `target?`): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-view/src/view.ts:138](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view.ts#lines-138)

Renders the view with the given view model, request, and optional target.

#### Parameters

##### viewModel

`any`

The view model.

##### request

`any`

The current request.

##### target?

[`ViewTarget`](../interfaces/ViewTarget.md)

The optional view target.

#### Returns

`void` \| `Promise`\<`void`\>
