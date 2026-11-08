[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-method](../README.md) / RouteHandlerMethod

# Class: RouteHandlerMethod

Encapsulates information about a handler method consisting of a `method` and `handler`.

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

The resolvers consulted to bind the parameters.

***

### factory

> `readonly` **factory**: [`Factory`](#) \| `null`

The factory that owns the handler, when constructed from one.

***

### handler

> `readonly` **handler**: `object`

The handler instance.

***

### method

> `readonly` **method**: `string`

The method name to invoke on the handler.

***

### name

> `readonly` **name**: `string` \| `null`

The handler's registered factory name.

***

### parameters

> **parameters**: [`MethodParameter`](../../parameter-types/classes/MethodParameter.md)[]

The method's parameter metadata.

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, ...`foo`): `ModelAndView`

Invokes the handler method, binding the declared parameters first.

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

The route being resolved.

##### foo

...`unknown`[]

Ignored; present so subclasses can pass handler arguments.

#### Returns

`ModelAndView`

The handler's result.

#### Implementation of

[`HandlerMethod`](../interfaces/HandlerMethod.md).[`invoke`](../interfaces/HandlerMethod.md#invoke)

***

### toString()

> **toString**(): `string`

Renders the handler and its parameters for debug output.

#### Returns

`string`

A human-readable description.

#### Implementation of

`Serializable.toString`
