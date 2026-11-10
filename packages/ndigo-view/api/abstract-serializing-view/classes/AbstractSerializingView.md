[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [abstract-serializing-view](../README.md) / AbstractSerializingView

# Abstract Class: AbstractSerializingView

Abstract base for views that encode their model into a document body — the
representation family served by content negotiation (JSON, CSV, text,
bytes, …).

Dual-mode like the EJS view (see `@ndigo/view-ejs`): renders into a [ViewTarget](../../view-target/interfaces/ViewTarget.md) (fragment
mode) and produces a complete [RenderResult](../../producer-view/interfaces/RenderResult.md) (document mode), both
from the same [\`serialize\`](#) encoding.
Subclasses declare their `mediaType` in the constructor and implement
`serialize`.

## Extends

- [`AbstractView`](../../view/classes/AbstractView.md)

## Extended by

- [`A2UIView`](../../a2ui-view/classes/A2UIView.md)
- [`CSVView`](../../csv-view/classes/CSVView.md)
- [`JSONView`](../../json-view/classes/JSONView.md)
- [`OctetStreamView`](../../octet-stream-view/classes/OctetStreamView.md)
- [`TextView`](../../text-view/classes/TextView.md)

## Implements

- [`ProducerView`](../../producer-view/interfaces/ProducerView.md)

## Constructors

### Constructor

> **new AbstractSerializingView**(): `AbstractSerializingView`

#### Returns

`AbstractSerializingView`

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`constructor`](../../view/classes/AbstractView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`[$aware]`](../../view/classes/AbstractView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`destroyed`](../../view/classes/AbstractView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`mediaType`](../../view/classes/AbstractView.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`name`](../../view/classes/AbstractView.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`[toStringTag]`](../../view/classes/AbstractView.md#tostringtag)

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`destroy`](../../view/classes/AbstractView.md#destroy)

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

[`ViewTarget`](../../view-target/interfaces/ViewTarget.md)

The optional view target.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`render`](../../view/classes/AbstractView.md#render)

***

### renderTo()

> **renderTo**(`model`, `_route`): `Promise`\<[`RenderResult`](../../producer-view/interfaces/RenderResult.md)\>

Produces the serialized document for document mode.

#### Parameters

##### model

`unknown`

The data model to encode.

##### \_route

[`Route`](#)

The current route (unused).

#### Returns

`Promise`\<[`RenderResult`](../../producer-view/interfaces/RenderResult.md)\>

The encoded body and its media type.

#### Implementation of

[`ProducerView`](../../producer-view/interfaces/ProducerView.md).[`renderTo`](../../producer-view/interfaces/ProducerView.md#renderto)

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

[`AbstractView`](../../view/classes/AbstractView.md).[`setApplicationContext`](../../view/classes/AbstractView.md#setapplicationcontext)

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

[`AbstractView`](../../view/classes/AbstractView.md).[`setName`](../../view/classes/AbstractView.md#setname)

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`toJSON`](../../view/classes/AbstractView.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractView`](../../view/classes/AbstractView.md).[`toString`](../../view/classes/AbstractView.md#tostring)
