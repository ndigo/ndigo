[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-view](../README.md) / EJSView

# Class: EJSView

A view that renders an EJS template into HTML.

The template source comes from one of two places, in order of precedence:

1. an inline [\`template\`](#template) string, or
2. a `path` resolved through a [ResourceLoader](#) — the injected
   `loader`, or the view's application context.

Like a self-rendering `View`, the view renders into a supplied
[ViewTarget](#) for fragment mode (islands, client-side DOM) and —
through [ProducerView](#) — produces a whole HTML page for document mode
(servlet/JSP-style server-side rendering).

## Extends

- `AbstractTemplateView`

## Implements

- [`ProducerView`](#)

## Constructors

### Constructor

> **new EJSView**(`path?`, `options?`): `EJSView`

Creates a new EJS view.

#### Parameters

##### path?

`string` \| `null` = `null`

The template path (used with a [ResourceLoader](#)).

##### options?

[`EJSViewOptions`](../interfaces/EJSViewOptions.md) = `{}`

Engine and resource-loader options.

#### Returns

`EJSView`

#### Overrides

`AbstractTemplateView.constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AbstractTemplateView.[$aware]`

***

### applicationContext?

> `readonly` `optional` **applicationContext?**: `ApplicationContext`

The application context, provided by the mixin via `setApplicationContext`.
Declared here so TypeScript can see it through the mixin inheritance chain.

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

`AbstractTemplateView.destroyed`

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

`AbstractTemplateView.mediaType`

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

`AbstractTemplateView.name`

***

### path

> **path**: `string`

The path associated with the view.

#### Inherited from

`AbstractTemplateView.path`

***

### template?

> `optional` **template?**: `string`

An inline EJS template source. When set, it takes precedence over any
`path`/[ResourceLoader](#).

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

`AbstractTemplateView.[toStringTag]`

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

`AbstractTemplateView.destroy`

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

`AbstractTemplateView.render`

***

### renderTo()

> **renderTo**(`model`, `route`): `Promise`\<[`RenderResult`](#)\>

#### Parameters

##### model

`unknown`

##### route

[`Route`](#)

#### Returns

`Promise`\<[`RenderResult`](#)\>

#### Implementation of

`ProducerView.renderTo`

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

`AbstractTemplateView.setApplicationContext`

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

`AbstractTemplateView.setName`

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Inherited from

`AbstractTemplateView.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

`AbstractTemplateView.toString`
