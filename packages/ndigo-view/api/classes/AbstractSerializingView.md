[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / AbstractSerializingView

# Abstract Class: AbstractSerializingView

Abstract base for views that encode their model into a document body — the
representation family served by content negotiation (JSON, CSV, text,
bytes, …).

Dual-mode like the EJS view (see `@ndigo/view-ejs`): renders into a [ViewTarget](../interfaces/ViewTarget.md) (fragment
mode) and produces a complete [RenderResult](../interfaces/RenderResult.md) (document mode), both
from the same [\`serialize\`](#) encoding.
Subclasses declare their `mediaType` in the constructor and implement
`serialize`.

## Extends

- [`AbstractView`](AbstractView.md)

## Extended by

- [`JSONView`](JSONView.md)
- [`TextView`](TextView.md)
- [`CSVView`](CSVView.md)
- [`OctetStreamView`](OctetStreamView.md)

## Implements

- [`ProducerView`](../interfaces/ProducerView.md)

## Constructors

### Constructor

> **new AbstractSerializingView**(): `AbstractSerializingView`

#### Returns

`AbstractSerializingView`

#### Inherited from

[`AbstractView`](AbstractView.md).[`constructor`](AbstractView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractView`](AbstractView.md).[`[$aware]`](AbstractView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractView`](AbstractView.md).[`destroyed`](AbstractView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`mediaType`](AbstractView.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`name`](AbstractView.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractView`](AbstractView.md).[`[toStringTag]`](AbstractView.md#tostringtag)

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractView`](AbstractView.md).[`destroy`](AbstractView.md#destroy)

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

[`AbstractView`](AbstractView.md).[`render`](AbstractView.md#render)

***

### renderTo()

> **renderTo**(`model`, `_route`): `Promise`\<[`RenderResult`](../interfaces/RenderResult.md)\>

Renders the view to a complete response document.

#### Parameters

##### model

`unknown`

The data model supplied to the view.

##### \_route

[`Route`](#)

The current route.

#### Returns

`Promise`\<[`RenderResult`](../interfaces/RenderResult.md)\>

The response document.

#### Implementation of

[`ProducerView`](../interfaces/ProducerView.md).[`renderTo`](../interfaces/ProducerView.md#renderto)

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

[`AbstractView`](AbstractView.md).[`setApplicationContext`](AbstractView.md#setapplicationcontext)

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

[`AbstractView`](AbstractView.md).[`setName`](AbstractView.md#setname)

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`toJSON`](AbstractView.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractView`](AbstractView.md).[`toString`](AbstractView.md#tostring)
