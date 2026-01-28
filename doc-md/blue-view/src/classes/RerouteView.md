[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / RerouteView

# Class: RerouteView

Defined in: packages/blue-view/src/view.ts:131

View that reroutes to an absolute, context relative, or current request relative route.

## Extends

- [`AbstractPathBasedView`](AbstractPathBasedView.md)

## Constructors

### Constructor

> **new RerouteView**(`path`, `contextRelative`): `RerouteView`

Defined in: packages/blue-view/src/view.ts:134

#### Parameters

##### path

`string`

##### contextRelative

`boolean` = `false`

#### Returns

`RerouteView`

#### Overrides

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`constructor`](AbstractPathBasedView.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`[$aware]`](AbstractPathBasedView.md#aware)

***

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/view.ts:16

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`mediaType`](AbstractPathBasedView.md#mediatype)

***

### name

> **name**: `string`

Defined in: packages/blue-view/src/view.ts:17

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`name`](AbstractPathBasedView.md#name)

***

### path

> **path**: `string`

Defined in: packages/blue-view/src/view.ts:53

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`path`](AbstractPathBasedView.md#path)

***

### contextRelative

> **contextRelative**: `boolean`

Defined in: packages/blue-view/src/view.ts:132

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-view/src/view.ts:55

##### Returns

`string`

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`[toStringTag]`](AbstractPathBasedView.md#tostringtag)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`setApplicationContext`](AbstractPathBasedView.md#setapplicationcontext)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`setName`](AbstractPathBasedView.md#setname)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`render`](AbstractPathBasedView.md#render)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-view/src/view.ts:40

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`toString`](AbstractPathBasedView.md#tostring)

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

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`_createViewModel`](AbstractPathBasedView.md#_createviewmodel)

***

### toJSON()

> **toJSON**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-view/src/view.ts:71

#### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Inherited from

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`toJSON`](AbstractPathBasedView.md#tojson)

***

### \_createTargetPath()

> `protected` **\_createTargetPath**(`model`, `request`): `string`

Defined in: packages/blue-view/src/view.ts:139

#### Parameters

##### model

`any`

##### request

`any`

#### Returns

`string`

***

### \_renderView()

> `protected` **\_renderView**(`viewModel`, `request`): `void`

Defined in: packages/blue-view/src/view.ts:144

#### Parameters

##### viewModel

`any`

##### request

`any`

#### Returns

`void`

#### Overrides

[`AbstractPathBasedView`](AbstractPathBasedView.md).[`_renderView`](AbstractPathBasedView.md#_renderview)
