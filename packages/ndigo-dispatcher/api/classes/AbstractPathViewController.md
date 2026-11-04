[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AbstractPathViewController

# Abstract Class: AbstractPathViewController

Abstract base class for controllers that resolve view names from the route path.

## Extended by

- [`PathViewController`](PathViewController.md)

## Implements

- [`Controller`](../interfaces/Controller.md)

## Constructors

### Constructor

> **new AbstractPathViewController**(): `AbstractPathViewController`

#### Returns

`AbstractPathViewController`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Returns the string tag for this controller.

##### Returns

`string`

## Methods

### handleRoute()

> **handleRoute**(`route`): [`ModelAndView`](ModelAndView.md)

Handles the given route by resolving a view name from its path and returning a new [ModelAndView](ModelAndView.md).

#### Parameters

##### route

[`Route`](#)

The route to handle.

#### Returns

[`ModelAndView`](ModelAndView.md)

A [ModelAndView](ModelAndView.md) for the route.

#### Implementation of

[`Controller`](../interfaces/Controller.md).[`handleRoute`](../interfaces/Controller.md#handleroute)
