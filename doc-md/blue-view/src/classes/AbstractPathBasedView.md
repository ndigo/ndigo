[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractPathBasedView

# Abstract Class: AbstractPathBasedView

Defined in: packages/blue-view/src/view.ts:52

## Extends

- [`AbstractView`](AbstractView.md)

## Extended by

- [`AbstractTemplateView`](AbstractTemplateView.md)
- [`RerouteView`](RerouteView.md)

## Constructors

### Constructor

> **new AbstractPathBasedView**(`path`): `AbstractPathBasedView`

Defined in: packages/blue-view/src/view.ts:59

#### Parameters

##### path

`string` = `null`

#### Returns

`AbstractPathBasedView`

#### Overrides

[`AbstractView`](AbstractView.md).[`constructor`](AbstractView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

[`AbstractView`](AbstractView.md).[`[$aware]`](AbstractView.md#aware)

***

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/view.ts:16

#### Inherited from

[`AbstractView`](AbstractView.md).[`mediaType`](AbstractView.md#mediatype)

***

### name

> **name**: `string`

Defined in: packages/blue-view/src/view.ts:17

#### Inherited from

[`AbstractView`](AbstractView.md).[`name`](AbstractView.md#name)

***

### path

> **path**: `string`

Defined in: packages/blue-view/src/view.ts:53

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/src/view.ts:55

##### Returns

`string`

#### Overrides

[`AbstractView`](AbstractView.md).[`[toStringTag]`](AbstractView.md#tostringtag)

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

[`AbstractView`](AbstractView.md).[`setApplicationContext`](AbstractView.md#setapplicationcontext)

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

[`AbstractView`](AbstractView.md).[`setName`](AbstractView.md#setname)

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

#### Inherited from

[`AbstractView`](AbstractView.md).[`render`](AbstractView.md#render)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/src/view.ts:40

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`AbstractView`](AbstractView.md).[`toString`](AbstractView.md#tostring)

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

#### Inherited from

[`AbstractView`](AbstractView.md).[`_createViewModel`](AbstractView.md#_createviewmodel)

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

#### Inherited from

[`AbstractView`](AbstractView.md).[`_renderView`](AbstractView.md#_renderview)

***

### toJSON()

> **toJSON**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-view/src/view.ts:71

#### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Overrides

[`AbstractView`](AbstractView.md).[`toJSON`](AbstractView.md#tojson)
