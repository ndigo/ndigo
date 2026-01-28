[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / PathViewController

# Class: PathViewController

Defined in: packages/blue-dispatcher/src/controller.ts:59

Simple [Controller](../interfaces/Controller.md) implementation that transforms the path of a route into a view name.
Can optionaly prepend a prefix and/or append a suffix a build the view name from the path.

## Extends

- [`AbstractPathViewController`](AbstractPathViewController.md)

## Constructors

### Constructor

> **new PathViewController**(): `PathViewController`

Defined in: packages/blue-dispatcher/src/controller.ts:82

#### Returns

`PathViewController`

#### Overrides

[`AbstractPathViewController`](AbstractPathViewController.md).[`constructor`](AbstractPathViewController.md#constructor)

## Properties

### \_viewNameCache

> **\_viewNameCache**: `Map`\<`string`, `string`\>

Defined in: packages/blue-dispatcher/src/controller.ts:60

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:21

##### Returns

`string`

#### Inherited from

[`AbstractPathViewController`](AbstractPathViewController.md).[`[toStringTag]`](AbstractPathViewController.md#tostringtag)

***

### prefix

#### Get Signature

> **get** **prefix**(): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:64

##### Returns

`string`

#### Set Signature

> **set** **prefix**(`newPrefix`): `void`

Defined in: packages/blue-dispatcher/src/controller.ts:68

##### Parameters

###### newPrefix

`string`

##### Returns

`void`

***

### suffix

#### Get Signature

> **get** **suffix**(): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:73

##### Returns

`string`

#### Set Signature

> **set** **suffix**(`newSuffix`): `void`

Defined in: packages/blue-dispatcher/src/controller.ts:77

##### Parameters

###### newSuffix

`string`

##### Returns

`void`

## Methods

### handleRoute()

> **handleRoute**(`route`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/controller.ts:25

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

[`ModelAndView`](ModelAndView.md)

#### Inherited from

[`AbstractPathViewController`](AbstractPathViewController.md).[`handleRoute`](AbstractPathViewController.md#handleroute)

***

### \_getViewNameForRoute()

> `protected` **\_getViewNameForRoute**(`route`): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:99

*

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`

#### Overrides

[`AbstractPathViewController`](AbstractPathViewController.md).[`_getViewNameForRoute`](AbstractPathViewController.md#_getviewnameforroute)

***

### \_getViewNameForPath()

> `protected` **\_getViewNameForPath**(`path`): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:108

*

#### Parameters

##### path

`string`

#### Returns

`string`
