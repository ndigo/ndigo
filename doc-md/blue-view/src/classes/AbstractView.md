[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractView

# Abstract Class: AbstractView

Defined in: packages/blue-view/src/view.ts:15

## Extends

- [`NameAware`](../../../blue-factory/src/interfaces/NameAware.md) & [`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md) & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Extended by

- [`AbstractPathBasedView`](AbstractPathBasedView.md)

## Implements

- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)
- [`View`](../interfaces/View.md)

## Constructors

### Constructor

> **new AbstractView**(): `AbstractView`

Defined in: packages/blue-view/src/view.ts:23

#### Returns

`AbstractView`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/view.ts:16

#### Implementation of

[`View`](../interfaces/View.md).[`mediaType`](../interfaces/View.md#mediatype)

***

### name

> **name**: `string`

Defined in: packages/blue-view/src/view.ts:17

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/src/view.ts:19

##### Returns

`string`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/src/context.ts:57

#### Parameters

##### applicationContext

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/src/aware.ts:21

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).setName`

***

### render()

> **render**(`model`, `request`): `void`

Defined in: packages/blue-view/src/view.ts:28

#### Parameters

##### model

`any`

##### request

`any`

#### Returns

`void`

#### Implementation of

[`View`](../interfaces/View.md).[`render`](../interfaces/View.md#render)

***

### toJSON()

> **toJSON**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-view/src/view.ts:33

#### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/src/view.ts:40

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)

***

### \_createViewModel()

> `protected` **\_createViewModel**(`model`, `request`): `any`

Defined in: packages/blue-view/src/view.ts:44

#### Parameters

##### model

`any`

##### request

`any`

#### Returns

`any`

***

### \_renderView()

> `abstract` `protected` **\_renderView**(`viewModel`, `request`): `void`

Defined in: packages/blue-view/src/view.ts:48

#### Parameters

##### viewModel

`any`

##### request

`any`

#### Returns

`void`
