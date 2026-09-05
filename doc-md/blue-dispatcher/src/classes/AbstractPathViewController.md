[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractPathViewController

# Abstract Class: AbstractPathViewController

Defined in: [packages/blue-dispatcher/src/controller.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/controller.ts#lines-23)

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

Defined in: [packages/blue-dispatcher/src/controller.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/controller.ts#lines-27)

Returns the string tag for this controller.

##### Returns

`string`

## Methods

### handleRoute()

> **handleRoute**(`route`): [`ModelAndView`](ModelAndView.md)

Defined in: [packages/blue-dispatcher/src/controller.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/controller.ts#lines-36)

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

***

### \_getViewNameForRoute()

> `abstract` `protected` **\_getViewNameForRoute**(`route`): `string`

Defined in: [packages/blue-dispatcher/src/controller.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/controller.ts#lines-41)

#### Parameters

##### route

[`Route`](#)

#### Returns

`string`
