[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [controller](../README.md) / PathViewController

# Class: PathViewController

Simple [Controller](../interfaces/Controller.md) implementation that transforms the path of a route into a view name.
Can optionally prepend a prefix and/or append a suffix to build the view name from the path.

## Extends

- [`AbstractPathViewController`](AbstractPathViewController.md)

## Constructors

### Constructor

> **new PathViewController**(): `PathViewController`

Creates an instance of PathViewController.

#### Returns

`PathViewController`

#### Overrides

[`AbstractPathViewController`](AbstractPathViewController.md).[`constructor`](AbstractPathViewController.md#constructor)

## Properties

### \_viewNameCache

> **\_viewNameCache**: `Map`\<`string`, `string`\>

Cache for resolved view names.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this controller.

##### Returns

`string`

#### Inherited from

[`AbstractPathViewController`](AbstractPathViewController.md).[`[toStringTag]`](AbstractPathViewController.md#tostringtag)

***

### prefix

#### Get Signature

> **get** **prefix**(): `string`

Gets the prefix to prepend to the view name.

##### Returns

`string`

#### Set Signature

> **set** **prefix**(`newPrefix`): `void`

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

Gets the suffix to append to the view name.

##### Returns

`string`

#### Set Signature

> **set** **suffix**(`newSuffix`): `void`

Sets the suffix to append to the view name.
Clears the view name cache when set.

##### Parameters

###### newSuffix

`string`

##### Returns

`void`

## Methods

### handleRoute()

> **handleRoute**(`route`): [`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

Handles the given route by resolving a view name from its path and returning a new [ModelAndView](../../model-and-view/classes/ModelAndView.md).

#### Parameters

##### route

[`Route`](#)

The route to handle.

#### Returns

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

A [ModelAndView](../../model-and-view/classes/ModelAndView.md) for the route.

#### Inherited from

[`AbstractPathViewController`](AbstractPathViewController.md).[`handleRoute`](AbstractPathViewController.md#handleroute)
