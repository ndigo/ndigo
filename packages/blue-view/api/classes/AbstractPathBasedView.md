[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / AbstractPathBasedView

# Abstract Class: AbstractPathBasedView

Abstract base class for path-based views.

## Extends

- [`AbstractView`](AbstractView.md)

## Extended by

- [`AbstractTemplateView`](AbstractTemplateView.md)
- [`RerouteView`](RerouteView.md)

## Constructors

### Constructor

> **new AbstractPathBasedView**(`path?`): `AbstractPathBasedView`

#### Parameters

##### path?

`string` \| `null` = `null`

#### Returns

`AbstractPathBasedView`

#### Overrides

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

***

### path

> **path**: `string`

The path associated with the view.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Overrides

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

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Overrides

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
