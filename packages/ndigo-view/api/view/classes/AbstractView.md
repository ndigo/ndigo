[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view](../README.md) / AbstractView

# Abstract Class: AbstractView

Abstract base class for [\`View\`](../interfaces/View.md) implementations. Subclasses need to implement the actual rendering.

## Extends

- `NameAware` & `ApplicationContextAware` & `Null`\<`this`\>

## Extended by

- [`AbstractSerializingView`](../../abstract-serializing-view/classes/AbstractSerializingView.md)
- [`AbstractPathBasedView`](AbstractPathBasedView.md)

## Implements

- `Serializable`
- [`View`](../interfaces/View.md)

## Constructors

### Constructor

> **new AbstractView**(): `AbstractView`

#### Returns

`AbstractView`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### destroyed

> **destroyed**: `boolean`

Indicates if the view has been destroyed.

#### Implementation of

[`View`](../interfaces/View.md).[`destroyed`](../interfaces/View.md#destroyed)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

The media type of the view.

#### Implementation of

[`View`](../interfaces/View.md).[`mediaType`](../interfaces/View.md#mediatype)

***

### name

> **name**: `string`

The name of the view.

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this view.

##### Returns

`string`

The string tag.

## Methods

### destroy()

> **destroy**(): `void`

Destroys the view, releasing any resources.

#### Returns

`void`

#### Implementation of

[`View`](../interfaces/View.md).[`destroy`](../interfaces/View.md#destroy)

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

#### Implementation of

[`View`](../interfaces/View.md).[`render`](../interfaces/View.md#render)

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

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

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

`AsNameAware(AsApplicationContextAware(Null)).setName`

***

### toJSON()

> **toJSON**(): `JSONObject`

Returns a JSON representation of the view.

#### Returns

`JSONObject`

A JSON object representing the view.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the view.

#### Returns

`string`

A string representing the view.

#### Implementation of

`Serializable.toString`
