[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / AbstractTemplateView

# Abstract Class: AbstractTemplateView

Abstract base class for template-based views.

## Extends

- [`AbstractPathBasedView`](AbstractPathBasedView.md)

## Extended by

- [`StringTemplateView`](StringTemplateView.md)
- [`IslandView`](IslandView.md)

## Constructors

### Constructor

> **new AbstractTemplateView**(`path?`): `AbstractTemplateView`

#### Parameters

##### path?

`string` \| `null` = `null`

#### Returns

`AbstractTemplateView`

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`constructor`](AbstractPathBasedView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`[$aware]`](AbstractPathBasedView.md#aware)

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`destroyed`](AbstractPathBasedView.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`mediaType`](AbstractPathBasedView.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`name`](AbstractPathBasedView.md#name)

***

### path

> **path**: `string`

The path associated with the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`path`](AbstractPathBasedView.md#path)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`[toStringTag]`](AbstractPathBasedView.md#tostringtag)

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`destroy`](AbstractPathBasedView.md#destroy)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`render`](AbstractPathBasedView.md#render)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`setApplicationContext`](AbstractPathBasedView.md#setapplicationcontext)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`setName`](AbstractPathBasedView.md#setname)

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the path-based view.

#### Returns

`JSONObject`

A JSON object representing the path-based view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`toJSON`](AbstractPathBasedView.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`toString`](AbstractPathBasedView.md#tostring)
