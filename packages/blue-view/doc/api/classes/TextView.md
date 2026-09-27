[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / TextView

# Class: TextView

A view that encodes its model as plain text (`text/plain`).

Nullish models render an empty document; other values are coerced with
`String`.

## Extends

- [`AbstractSerializingView`](AbstractSerializingView.md)

## Constructors

### Constructor

> **new TextView**(): `TextView`

#### Returns

`TextView`

#### Overrides

[`AbstractSerializingView`](AbstractSerializingView.md).[`constructor`](AbstractSerializingView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`[$aware]`](AbstractSerializingView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`destroyed`](AbstractSerializingView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`mediaType`](AbstractSerializingView.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`name`](AbstractSerializingView.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`[toStringTag]`](AbstractSerializingView.md#tostringtag)

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`destroy`](AbstractSerializingView.md#destroy)

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

[`AbstractSerializingView`](AbstractSerializingView.md).[`render`](AbstractSerializingView.md#render)

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

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`renderTo`](AbstractSerializingView.md#renderto)

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

[`AbstractSerializingView`](AbstractSerializingView.md).[`setApplicationContext`](AbstractSerializingView.md#setapplicationcontext)

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

[`AbstractSerializingView`](AbstractSerializingView.md).[`setName`](AbstractSerializingView.md#setname)

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`toJSON`](AbstractSerializingView.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractSerializingView`](AbstractSerializingView.md).[`toString`](AbstractSerializingView.md#tostring)
