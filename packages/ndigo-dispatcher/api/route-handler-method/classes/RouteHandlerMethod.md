[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-method](../README.md) / RouteHandlerMethod

# Class: RouteHandlerMethod

A strategy for assigning a name to a route handler method's mapping.

The strategy can be configured on [AbstractHandlerMethodMapping](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).
It is used to assign a name to the mapping of every registered handler method.

## Extended by

- [`ErrorHandlerMethod`](ErrorHandlerMethod.md)

## Implements

- [`HandlerMethod`](../interfaces/HandlerMethod.md)
- `Serializable`

## Constructors

### Constructor

> **new RouteHandlerMethod**(`handler`, `method`, ...`args`): `RouteHandlerMethod`

#### Parameters

##### handler

`object`

##### method

`string`

##### args

...`unknown`[]

#### Returns

`RouteHandlerMethod`

### Constructor

> **new RouteHandlerMethod**(`factory`, `name`, `method`, ...`args`): `RouteHandlerMethod`

#### Parameters

##### factory

[`Factory`](#)

##### name

`string`

##### method

`string`

##### args

...`unknown`[]

#### Returns

`RouteHandlerMethod`

## Properties

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../../argument-resolver/interfaces/HandlerMethodArgumentResolver.md)[]

***

### factory

> `readonly` **factory**: [`Factory`](#) \| `null`

***

### handler

> `readonly` **handler**: `object`

***

### method

> `readonly` **method**: `string`

***

### name

> `readonly` **name**: `string` \| `null`

***

### parameters

> **parameters**: [`MethodParameter`](../../parameter-types/classes/MethodParameter.md)[]

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, ...`foo`): `ModelAndView`

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

##### foo

...`unknown`[]

#### Returns

`ModelAndView`

#### Implementation of

[`HandlerMethod`](../interfaces/HandlerMethod.md).[`invoke`](../interfaces/HandlerMethod.md#invoke)

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

`Serializable.toString`
