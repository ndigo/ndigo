[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / PathViewController

# Class: PathViewController

Defined in: packages/blue-dispatcher/src/controller.ts:48

Simple [Controller](../interfaces/Controller.md) implementation that transforms the path of a route into a view name.
Can optionally prepend a prefix and/or append a suffix to build the view name from the path.

## Extends

- [`AbstractPathViewController`](AbstractPathViewController.md)

## Constructors

### Constructor

> **new PathViewController**(): `PathViewController`

Defined in: packages/blue-dispatcher/src/controller.ts:91

Creates an instance of PathViewController.

#### Returns

`PathViewController`

#### Overrides

[`AbstractPathViewController`](AbstractPathViewController.md).[`constructor`](AbstractPathViewController.md#constructor)

## Properties

### \_viewNameCache

> **\_viewNameCache**: `Map`\<`string`, `string`\>

Defined in: packages/blue-dispatcher/src/controller.ts:52

Cache for resolved view names.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:27

Returns the string tag for this controller.

##### Returns

`string`

#### Inherited from

[`AbstractPathViewController`](AbstractPathViewController.md).[`[toStringTag]`](AbstractPathViewController.md#tostringtag)

***

### prefix

#### Get Signature

> **get** **prefix**(): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:59

Gets the prefix to prepend to the view name.

##### Returns

`string`

#### Set Signature

> **set** **prefix**(`newPrefix`): `void`

Defined in: packages/blue-dispatcher/src/controller.ts:67

Sets the prefix to prepend to the view name.
Clears the view name cache when set.

##### Parameters

###### newPrefix

`string`

##### Returns

`void`

***

### suffix

#### Get Signature

> **get** **suffix**(): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:75

Gets the suffix to append to the view name.

##### Returns

`string`

#### Set Signature

> **set** **suffix**(`newSuffix`): `void`

Defined in: packages/blue-dispatcher/src/controller.ts:83

Sets the suffix to append to the view name.
Clears the view name cache when set.

##### Parameters

###### newSuffix

`string`

##### Returns

`void`

## Methods

### handleRoute()

> **handleRoute**(`route`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/controller.ts:36

Handles the given route by resolving a view name from its path and returning a new [ModelAndView](ModelAndView.md).

#### Parameters

##### route

`Route`

The route to handle.

#### Returns

[`ModelAndView`](ModelAndView.md)

A [ModelAndView](ModelAndView.md) for the route.

#### Inherited from

[`AbstractPathViewController`](AbstractPathViewController.md).[`handleRoute`](AbstractPathViewController.md#handleroute)

***

### \_getViewNameForRoute()

> `protected` **\_getViewNameForRoute**(`route`): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:104

Resolves the view name for the given route.

#### Parameters

##### route

`Route`

The route to resolve the view name for.

#### Returns

`string`

The resolved view name.

#### Overrides

[`AbstractPathViewController`](AbstractPathViewController.md).[`_getViewNameForRoute`](AbstractPathViewController.md#_getviewnameforroute)

***

### \_getViewNameForPath()

> `protected` **\_getViewNameForPath**(`path`): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:113

Resolves the view name for the given path.

#### Parameters

##### path

`string`

The path to resolve the view name for.

#### Returns

`string`

The resolved view name.
