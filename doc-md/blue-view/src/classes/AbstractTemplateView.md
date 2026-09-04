[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractTemplateView

# Abstract Class: AbstractTemplateView

Defined in: packages/blue-view/src/view.ts:182

Abstract base class for template-based views.

## Extends

- [`AbstractPathBasedView`](AbstractPathBasedView.md)

## Extended by

- [`StringTemplateView`](StringTemplateView.md)

## Constructors

### Constructor

> **new AbstractTemplateView**(`path?`): `AbstractTemplateView`

Defined in: packages/blue-view/src/view.ts:155

#### Parameters

##### path?

`string` \| `null`

#### Returns

`AbstractTemplateView`

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`constructor`](AbstractPathBasedView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`[$aware]`](AbstractPathBasedView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-view/src/view.ts:50

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`destroyed`](AbstractPathBasedView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Defined in: packages/blue-view/src/view.ts:54

The media type of the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`mediaType`](AbstractPathBasedView.md#mediatype)

***

### name

> **name**: `string`

Defined in: packages/blue-view/src/view.ts:58

The name of the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`name`](AbstractPathBasedView.md#name)

***

### path

> **path**: `string`

Defined in: packages/blue-view/src/view.ts:149

The path associated with the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`path`](AbstractPathBasedView.md#path)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/src/view.ts:151

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`[toStringTag]`](AbstractPathBasedView.md#tostringtag)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`setApplicationContext`](AbstractPathBasedView.md#setapplicationcontext)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`setName`](AbstractPathBasedView.md#setname)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-view/src/view.ts:77

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`destroy`](AbstractPathBasedView.md#destroy)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`render`](AbstractPathBasedView.md#render)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/src/view.ts:115

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`toString`](AbstractPathBasedView.md#tostring)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`_createViewModel`](AbstractPathBasedView.md#_createviewmodel)

***

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-view/src/view.ts:171

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`toJSON`](AbstractPathBasedView.md#tojson)

***

### \_projectViewModel()

> `protected` **\_projectViewModel**(`viewModel`, `request`): `any`

Defined in: packages/blue-view/src/view.ts:190

Creates the template model from the view model.

#### Parameters

##### viewModel

`any`

The view model.

##### request

`any`

The current request.

#### Returns

`any`

The template model.

***

### \_renderTemplate()

> `abstract` `protected` **\_renderTemplate**(`templateModel`, `request`, `target?`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view.ts:202

Renders the template with the given template model and request.

#### Parameters

##### templateModel

`any`

The template data model.

##### request

`any`

The current request.

##### target?

[`ViewTarget`](../interfaces/ViewTarget.md)

The optional view target.

#### Returns

`void` \| `Promise`\<`void`\>

***

### \_renderView()

> `protected` **\_renderView**(`viewModel`, `request`, `target?`): `Promise`\<`void`\>

Defined in: packages/blue-view/src/view.ts:212

Renders the view with the given view model.

#### Parameters

##### viewModel

`any`

The view model to render.

##### request

`any`

The current request.

##### target?

[`ViewTarget`](../interfaces/ViewTarget.md)

The optional view target (required for rendering).

#### Returns

`Promise`\<`void`\>

#### Overrides

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`_renderView`](AbstractPathBasedView.md#_renderview)
