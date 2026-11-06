[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [csv-view](../README.md) / CSVView

# Class: CSVView

A view that encodes an array of record objects as a CSV document
(`text/csv`), RFC 4180-style: a header row, `\r\n` row endings, and
quoting of fields containing the delimiter, double quotes, or line breaks.

## Extends

- [`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md)

## Constructors

### Constructor

> **new CSVView**(`options?`): `CSVView`

#### Parameters

##### options?

[`CSVViewOptions`](../interfaces/CSVViewOptions.md) = `{}`

#### Returns

`CSVView`

#### Overrides

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`constructor`](../../abstract-serializing-view/classes/AbstractSerializingView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`[$aware]`](../../abstract-serializing-view/classes/AbstractSerializingView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`destroyed`](../../abstract-serializing-view/classes/AbstractSerializingView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`mediaType`](../../abstract-serializing-view/classes/AbstractSerializingView.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`name`](../../abstract-serializing-view/classes/AbstractSerializingView.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`[toStringTag]`](../../abstract-serializing-view/classes/AbstractSerializingView.md#tostringtag)

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`destroy`](../../abstract-serializing-view/classes/AbstractSerializingView.md#destroy)

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

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`render`](../../abstract-serializing-view/classes/AbstractSerializingView.md#render)

***

### renderTo()

> **renderTo**(`model`, `_route`): `Promise`\<[`RenderResult`](../../producer-view/interfaces/RenderResult.md)\>

#### Parameters

##### model

`unknown`

##### \_route

[`Route`](#)

#### Returns

`Promise`\<[`RenderResult`](../../producer-view/interfaces/RenderResult.md)\>

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`renderTo`](../../abstract-serializing-view/classes/AbstractSerializingView.md#renderto)

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

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`setApplicationContext`](../../abstract-serializing-view/classes/AbstractSerializingView.md#setapplicationcontext)

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

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`setName`](../../abstract-serializing-view/classes/AbstractSerializingView.md#setname)

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`toJSON`](../../abstract-serializing-view/classes/AbstractSerializingView.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md).[`toString`](../../abstract-serializing-view/classes/AbstractSerializingView.md#tostring)
