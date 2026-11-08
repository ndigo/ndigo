[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-method](../README.md) / ErrorHandlerMethod

# Class: ErrorHandlerMethod

Handler for the error path: `invoke` receives the `Route` and the thrown
error and returns the value the error resolver chain produced, mirroring
`RouteHandlerMethod`'s invocation contract.

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

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../../argument-resolver/interfaces/HandlerMethodArgumentResolver.md)[]

The resolvers consulted to bind the parameters.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`argumentResolvers`](RouteHandlerMethod.md#argumentresolvers)

***

### factory

> `readonly` **factory**: [`Factory`](#) \| `null`

The factory that owns the handler, when constructed from one.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`factory`](RouteHandlerMethod.md#factory)

***

### handler

> `readonly` **handler**: `object`

The handler instance.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`handler`](RouteHandlerMethod.md#handler)

***

### method

> `readonly` **method**: `string`

The method name to invoke on the handler.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`method`](RouteHandlerMethod.md#method)

***

### name

> `readonly` **name**: `string` \| `null`

The handler's registered factory name.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`name`](RouteHandlerMethod.md#name)

***

### parameters

> **parameters**: [`MethodParameter`](../../parameter-types/classes/MethodParameter.md)[]

The method's parameter metadata.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`parameters`](RouteHandlerMethod.md#parameters)

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, `error`, `handlerMethod`): `ModelAndView`

Invokes the error handler with the route and thrown error.

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

The route whose handler failed.

##### error

`Error`

The thrown error.

##### handlerMethod

[`RouteHandlerMethod`](RouteHandlerMethod.md)

The handler method that threw.

#### Returns

`ModelAndView`

The resolved error response.

#### Overrides

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`invoke`](RouteHandlerMethod.md#invoke)

***

### toString()

> **toString**(): `string`

Renders the handler and its parameters for debug output.

#### Returns

`string`

A human-readable description.

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`toString`](RouteHandlerMethod.md#tostring)
