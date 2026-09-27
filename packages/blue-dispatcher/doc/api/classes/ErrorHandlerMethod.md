[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / ErrorHandlerMethod

# Class: ErrorHandlerMethod

## Extends

- [`RouteHandlerMethod`](RouteHandlerMethod.md)

## Constructors

### Constructor

> **new ErrorHandlerMethod**(`handler`, `method`, ...`args`): `ErrorHandlerMethod`

#### Parameters

##### handler

`object`

##### method

`string`

##### args

...`unknown`[]

#### Returns

`ErrorHandlerMethod`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`constructor`](RouteHandlerMethod.md#constructor)

### Constructor

> **new ErrorHandlerMethod**(`factory`, `name`, `method`, ...`args`): `ErrorHandlerMethod`

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

`ErrorHandlerMethod`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`constructor`](RouteHandlerMethod.md#constructor)

## Properties

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`argumentResolvers`](RouteHandlerMethod.md#argumentresolvers)

***

### factory

> `readonly` **factory**: [`Factory`](#) \| `null`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`factory`](RouteHandlerMethod.md#factory)

***

### handler

> `readonly` **handler**: `object`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`handler`](RouteHandlerMethod.md#handler)

***

### method

> `readonly` **method**: `string`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`method`](RouteHandlerMethod.md#method)

***

### name

> `readonly` **name**: `string` \| `null`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`name`](RouteHandlerMethod.md#name)

***

### parameters

> **parameters**: [`MethodParameter`](MethodParameter.md)[]

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`parameters`](RouteHandlerMethod.md#parameters)

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, `error`, `handlerMethod`): `ModelAndView`

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

##### error

`Error`

##### handlerMethod

[`RouteHandlerMethod`](RouteHandlerMethod.md)

#### Returns

`ModelAndView`

#### Overrides

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`invoke`](RouteHandlerMethod.md#invoke)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`toString`](RouteHandlerMethod.md#tostring)
