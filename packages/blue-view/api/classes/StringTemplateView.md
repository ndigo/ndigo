[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / StringTemplateView

# Class: StringTemplateView

Renders a simple string template into HTML by replacing {{variable}} placeholders.

**Warning — RAW interpolation, security-sensitive.** Model values are
interpolated into the output without any HTML escaping. If a model value can
be influenced by end users, an unescaped `<script>`/attribute payload could
execute in the browser (stored/reflected XSS). Callers **must** pre-escape
HTML for any model value that is not fully trusted before passing it to this
view (or render user HTML through a dedicated slot like EJS `<%- … %>`). This
is a known, documented gap — see
`docs/migrations/2026-06-18_CONTENT_NEGOTIATION_AND_TEMPLATE_VIEW_CONTRACT.md`.
This view renders HTML snippets (e.g. `{{title}}` → `&lt;em&gt;Hi&lt;/em&gt;`)
and intentionally does not encode, so escaping is the caller's responsibility.

## Param

**path**

The URL path for this view.

## Extends

- [`AbstractTemplateView`](AbstractTemplateView.md)

## Constructors

### Constructor

> **new StringTemplateView**(`path?`): `StringTemplateView`

Creates a new StringTemplateView.

#### Parameters

##### path?

`string` \| `null`

The URL path for this view.

#### Returns

`StringTemplateView`

#### Overrides

[`AbstractTemplateView`](AbstractTemplateView.md).[`constructor`](AbstractTemplateView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`[$aware]`](AbstractTemplateView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`destroyed`](AbstractTemplateView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`mediaType`](AbstractTemplateView.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`name`](AbstractTemplateView.md#name)

***

### path

> **path**: `string`

The path associated with the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`path`](AbstractTemplateView.md#path)

***

### template

> **template**: `string`

The template string to render.

Supports simple Jinja-like syntax: {{variable}}, {{array[key]}}, etc.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`[toStringTag]`](AbstractTemplateView.md#tostringtag)

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`destroy`](AbstractTemplateView.md#destroy)

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

[`ViewTarget`](../interfaces/ViewTarget.md)

The optional view target.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`render`](AbstractTemplateView.md#render)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`setApplicationContext`](AbstractTemplateView.md#setapplicationcontext)

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

[`AbstractTemplateView`](AbstractTemplateView.md).[`setName`](AbstractTemplateView.md#setname)

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`toJSON`](AbstractTemplateView.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractTemplateView`](AbstractTemplateView.md).[`toString`](AbstractTemplateView.md#tostring)
