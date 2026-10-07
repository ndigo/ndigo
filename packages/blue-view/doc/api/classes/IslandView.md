[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / IslandView

# Class: IslandView

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

Creates an island view for the given custom element tag.

The tag name is interpolated raw into the rendered markup, so it is
validated against the custom-element grammar here — construction fails
loudly instead of emitting attacker-controlled markup.

#### Parameters

##### name

`string`

The custom element tag name.

#### Returns

`IslandView`

#### Throws

When `name` is not a valid custom-element name.

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

### tagName

> `readonly` **tagName**: `string`

The custom element tag name hydrated on the client.

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
