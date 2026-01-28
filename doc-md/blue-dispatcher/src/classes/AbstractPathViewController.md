[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractPathViewController

# Abstract Class: AbstractPathViewController

Defined in: packages/blue-dispatcher/src/controller.ts:20


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

Defined in: packages/blue-dispatcher/src/controller.ts:21

##### Returns

`string`

## Methods

### handleRoute()

> **handleRoute**(`route`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/controller.ts:25

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

[`ModelAndView`](ModelAndView.md)

#### Implementation of

[`Controller`](../interfaces/Controller.md).[`handleRoute`](../interfaces/Controller.md#handleroute)

***

### \_getViewNameForRoute()

> `abstract` `protected` **\_getViewNameForRoute**(`route`): `string`

Defined in: packages/blue-dispatcher/src/controller.ts:30

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`
