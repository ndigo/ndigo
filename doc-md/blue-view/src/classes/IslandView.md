[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / IslandView

# Class: IslandView

Defined in: packages/blue-view/src/island-view.ts:62

A server-rendered HTML view for partial hydration ("islands").

Renders an inert custom-element marker carrying the serialized view model:

```html
<my-element data-blue-island data-blue-model="&quot;{...}&quot;"></my-element>
```

It is fully server-safe (no `customElements`, no DOM, no component-module
import): it serializes only the model into markup. On the client,
`hydrateIslands()` (from `@blue/view-webcomponent`) finds the marker,
constructs the element, sets `.model`, and lets `connectedCallback` run.

## Example

```ts
return new ModelAndView(new IslandView('todo-app'), { items: [...], filter: 'all' });
```

## Since

1.0.0

## Extends

- [`AbstractTemplateView`](AbstractTemplateView.md)

## Constructors

### Constructor

> **new IslandView**(`name`): `IslandView`

Defined in: packages/blue-view/src/island-view.ts:73

Creates an island view for the given custom element tag.

#### Parameters

##### name

`string`

The custom element tag name.

#### Returns

`IslandView`

#### Overrides

[`AbstractTemplateView`](AbstractTemplateView.md).[`constructor`](AbstractTemplateView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`[$aware]`](AbstractTemplateView.md#aware)

***

### tagName

> `readonly` **tagName**: `string`

Defined in: packages/blue-view/src/island-view.ts:66

The custom element tag name hydrated on the client.

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-view/src/view.ts:50

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`destroyed`](AbstractTemplateView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Defined in: packages/blue-view/src/view.ts:54

The media type of the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`mediaType`](AbstractTemplateView.md#mediatype)

***

### name

> **name**: `string`

Defined in: packages/blue-view/src/view.ts:58

The name of the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`name`](AbstractTemplateView.md#name)

***

### path

> **path**: `string`

Defined in: packages/blue-view/src/view.ts:149

The path associated with the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`path`](AbstractTemplateView.md#path)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`[toStringTag]`](AbstractTemplateView.md#tostringtag)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`setApplicationContext`](AbstractTemplateView.md#setapplicationcontext)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`setName`](AbstractTemplateView.md#setname)

***

### \_renderTemplate()

> `protected` **\_renderTemplate**(`templateModel`, `request`, `target?`): `Promise`\<`void`\>

Defined in: packages/blue-view/src/island-view.ts:85

Renders the island markup: the element tag with the serialized model.

#### Parameters

##### templateModel

`any`

The view model to serialize.

##### request

`any`

The current request (unused).

##### target?

[`ViewTarget`](../interfaces/ViewTarget.md)

The view target to commit the HTML string to.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`AbstractTemplateView`](AbstractTemplateView.md).[`_renderTemplate`](AbstractTemplateView.md#_rendertemplate)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-view/src/view.ts:77

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`destroy`](AbstractTemplateView.md#destroy)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`render`](AbstractTemplateView.md#render)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/src/view.ts:115

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`toString`](AbstractTemplateView.md#tostring)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`_createViewModel`](AbstractTemplateView.md#_createviewmodel)

***

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-view/src/view.ts:171

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`toJSON`](AbstractTemplateView.md#tojson)

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

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`_projectViewModel`](AbstractTemplateView.md#_projectviewmodel)

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

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`_renderView`](AbstractTemplateView.md#_renderview)
