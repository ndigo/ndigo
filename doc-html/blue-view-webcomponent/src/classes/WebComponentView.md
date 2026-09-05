[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / WebComponentView

# Class: WebComponentView

Defined in: [packages/blue-view-webcomponent/src/view.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-20)

Template view base that delegates rendering to a web component view engine.

## Extends

- `AbstractTemplateView`

## Constructors

### Constructor

> **new WebComponentView**(`name`): `WebComponentView`

Defined in: [packages/blue-view-webcomponent/src/view.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-39)

Creates a view bound to a specific custom element tag name.

#### Parameters

##### name

`string`

The custom element tag name to render.

#### Returns

`WebComponentView`

#### Overrides

`AbstractTemplateView.constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AbstractTemplateView.[$aware]`

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-view/lib/view.d.ts:44

Indicates if the view has been destroyed.

#### Inherited from

`AbstractTemplateView.destroyed`

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Defined in: packages/blue-view/lib/view.d.ts:48

The media type of the view.

#### Inherited from

`AbstractTemplateView.mediaType`

***

### name

> **name**: `string`

Defined in: packages/blue-view/lib/view.d.ts:52

The name of the view.

#### Inherited from

`AbstractTemplateView.name`

***

### path

> **path**: `string`

Defined in: packages/blue-view/lib/view.d.ts:106

The path associated with the view.

#### Inherited from

`AbstractTemplateView.path`

***

### tagName

> **tagName**: `string`

Defined in: [packages/blue-view-webcomponent/src/view.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-24)

The custom element tag name rendered by this view.

***

### template

> **template**: `string`

Defined in: [packages/blue-view-webcomponent/src/view.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-28)

The template root used to instantiate the component markup.

***

### applicationContext?

> `readonly` `optional` **applicationContext?**: `ApplicationContextLike`

Defined in: [packages/blue-view-webcomponent/src/view.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-32)

Application context used to resolve the web component view engine.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/lib/view.d.ts:107

##### Returns

`string`

#### Inherited from

`AbstractTemplateView.[toStringTag]`

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

`AbstractTemplateView.setApplicationContext`

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

`AbstractTemplateView.setName`

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-view/lib/view.d.ts:62

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

`AbstractTemplateView.destroy`

***

### render()

> **render**(`model`, `request`, `target?`): `Promise`\<`void`\>

Defined in: packages/blue-view/lib/view.d.ts:69

Render the view given the specified model.

#### Parameters

##### model

`any`

The data model.

##### request

`any`

The current request.

##### target?

`ViewTarget`

The optional view target.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`AbstractTemplateView.render`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/lib/view.d.ts:79

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

`AbstractTemplateView.toString`

***

### \_createViewModel()

> `protected` **\_createViewModel**(`model`, `request`): `any`

Defined in: packages/blue-view/lib/view.d.ts:87

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

`AbstractTemplateView._createViewModel`

***

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-view/lib/view.d.ts:113

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Inherited from

`AbstractTemplateView.toJSON`

***

### \_projectViewModel()

> `protected` **\_projectViewModel**(`viewModel`, `request`): `any`

Defined in: packages/blue-view/lib/view.d.ts:127

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

#### Inherited from

`AbstractTemplateView._projectViewModel`

***

### \_renderTemplate()

> `abstract` `protected` **\_renderTemplate**(`templateModel`, `request`): `void`

Defined in: [packages/blue-view-webcomponent/src/view.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-45)

Renders the template with the given template model and request.

#### Parameters

##### templateModel

`any`

The template data model.

##### request

`any`

The current request.

#### Returns

`void`

#### Overrides

`AbstractTemplateView._renderTemplate`

***

### \_renderView()

> `protected` **\_renderView**(`viewModel`, `request`, `target?`): `Promise`\<`void`\>

Defined in: [packages/blue-view-webcomponent/src/view.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/view.ts#lines-49)

Renders the view with the given view model.

#### Parameters

##### viewModel

`any`

The view model to render.

##### request

`any`

The current request.

##### target?

`ViewTarget`

The optional view target (required for rendering).

#### Returns

`Promise`\<`void`\>

#### Overrides

`AbstractTemplateView._renderView`
