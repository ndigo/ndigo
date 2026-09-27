[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteHandlerMethod

# Class: RouteHandlerMethod

## Param

**handlerMethod**

## Param

**mapping**

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

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

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

> **parameters**: [`MethodParameter`](MethodParameter.md)[]

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

#### Returns

`string`

#### Implementation of

`Serializable.toString`
