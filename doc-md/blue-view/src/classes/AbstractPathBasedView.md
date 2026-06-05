[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractPathBasedView

# Abstract Class: AbstractPathBasedView

Defined in: packages/blue-view/src/view.ts:145

Abstract base class for path-based views.

## Extends

- [`AbstractView`](AbstractView.md)

## Extended by

- [`AbstractTemplateView`](AbstractTemplateView.md)
- [`RerouteView`](RerouteView.md)

## Constructors

### Constructor

> **new AbstractPathBasedView**(`path?`): `AbstractPathBasedView`

Defined in: packages/blue-view/src/view.ts:155

#### Parameters

##### path?

`string` = `null`

#### Returns

`AbstractPathBasedView`

#### Overrides

[`AbstractView`](AbstractView.md).[`constructor`](AbstractView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractView`](AbstractView.md).[`[$aware]`](AbstractView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-view/src/view.ts:50

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractView`](AbstractView.md).[`destroyed`](AbstractView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType`

Defined in: packages/blue-view/src/view.ts:54

The media type of the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`mediaType`](AbstractView.md#mediatype)

***

### name

> **name**: `string`

Defined in: packages/blue-view/src/view.ts:58

The name of the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`name`](AbstractView.md#name)

***

### path

> **path**: `string`

Defined in: packages/blue-view/src/view.ts:149

The path associated with the view.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/src/view.ts:151

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Overrides

[`AbstractView`](AbstractView.md).[`[toStringTag]`](AbstractView.md#tostringtag)

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

[`AbstractView`](AbstractView.md).[`setApplicationContext`](AbstractView.md#setapplicationcontext)

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/lib/aware.d.ts:38

Set the name of the value in the factory that created it.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### name

`string`

The name of the value in the factory.

#### Returns

`void`

#### Inherited from

[`AbstractView`](AbstractView.md).[`setName`](AbstractView.md#setname)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-view/src/view.ts:77

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractView`](AbstractView.md).[`destroy`](AbstractView.md#destroy)

***

### render()

> **render**(`model`, `request`, `target?`): `Promise`\<`void`\>

Defined in: packages/blue-view/src/view.ts:91

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

#### Inherited from

[`AbstractView`](AbstractView.md).[`render`](AbstractView.md#render)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/src/view.ts:115

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`toString`](AbstractView.md#tostring)

***

### \_createViewModel()

> `protected` **\_createViewModel**(`model`, `request`): `any`

Defined in: packages/blue-view/src/view.ts:126

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

#### Inherited from

[`AbstractView`](AbstractView.md).[`_createViewModel`](AbstractView.md#_createviewmodel)

***

### \_renderView()

> `abstract` `protected` **\_renderView**(`viewModel`, `request`, `target?`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view.ts:138

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

#### Inherited from

[`AbstractView`](AbstractView.md).[`_renderView`](AbstractView.md#_renderview)

***

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-view/src/view.ts:171

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Overrides

[`AbstractView`](AbstractView.md).[`toJSON`](AbstractView.md#tojson)
