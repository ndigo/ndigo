[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [view](../README.md) / WebComponentView

# Class: WebComponentView

A view that renders a custom element into a view target.

Rendering creates an element for [\`tagName\`](#tagname),
binds the view model to it, and commits it to the target — the element's own
custom-element lifecycle performs the actual rendering. Placement and reuse
of the rendered subtree belong to the target.

Components MUST render from the `model` setter, not `connectedCallback`
alone: `MemoryViewTarget` retains the element without attaching it to the
DOM, so `connectedCallback` never fires under test harnesses (and
`requestAnimationFrame`-gated targets defer attach). Treat
`connectedCallback` as a real-DOM fallback only.

## Extends

- `AbstractView`

## Constructors

### Constructor

> **new WebComponentView**(`tagName`): `WebComponentView`

Creates a view bound to a specific custom element tag name.

#### Parameters

##### tagName

`string`

The custom element tag name to render.

#### Returns

`WebComponentView`

#### Overrides

`AbstractView.constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AbstractView.[$aware]`

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

`AbstractView.destroyed`

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

`AbstractView.mediaType`

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

`AbstractView.name`

***

### tagName

> **tagName**: `string`

The custom element tag name rendered by this view.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

`AbstractView.[toStringTag]`

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

`AbstractView.destroy`

***

### render()

> **render**(`model`, `request`, `target?`): `Promise`\<`void`\>

Render the view given the specified model.

#### Parameters

##### model

`unknown`

The data model.

##### request

`unknown`

The current request.

##### target?

[`ViewTarget`](#)

The optional view target.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`AbstractView.render`

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AbstractView.setApplicationContext`

***

### setName()

> **setName**(`name`): `void`

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

`AbstractView.setName`

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Inherited from

`AbstractView.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

`AbstractView.toString`
