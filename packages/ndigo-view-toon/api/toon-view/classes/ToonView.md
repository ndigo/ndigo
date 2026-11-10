[**@ndigo/view-toon v0.0.1**](../../README.md)

***

[@ndigo/view-toon](../../README.md) / [toon-view](../README.md) / ToonView

# Class: ToonView

Serializes a model as `text/toon;charset=utf-8` — the provisional media
type's text/* default charset, matching spec §17.

## Extends

- `AbstractSerializingView`

## Constructors

### Constructor

> **new ToonView**(`options?`): `ToonView`

Creates the view; per-route options tune indentation and delimiter.

#### Parameters

##### options?

[`ToonEncodeOptions`](../../toon-encode/interfaces/ToonEncodeOptions.md) = `{}`

TOON encoding options.

#### Returns

`ToonView`

#### Overrides

`AbstractSerializingView.constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AbstractSerializingView.[$aware]`

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

`AbstractSerializingView.destroyed`

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

`AbstractSerializingView.mediaType`

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

`AbstractSerializingView.name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

`AbstractSerializingView.[toStringTag]`

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

`AbstractSerializingView.destroy`

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

`AbstractSerializingView.render`

***

### renderTo()

> **renderTo**(`model`, `_route`): `Promise`\<[`RenderResult`](#)\>

Produces the serialized document for document mode.

#### Parameters

##### model

`unknown`

The data model to encode.

##### \_route

[`Route`](#)

The current route (unused).

#### Returns

`Promise`\<[`RenderResult`](#)\>

The encoded body and its media type.

#### Inherited from

`AbstractSerializingView.renderTo`

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

`AbstractSerializingView.setApplicationContext`

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

`AbstractSerializingView.setName`

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Inherited from

`AbstractSerializingView.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

`AbstractSerializingView.toString`
