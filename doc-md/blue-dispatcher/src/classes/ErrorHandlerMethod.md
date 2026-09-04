[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ErrorHandlerMethod

# Class: ErrorHandlerMethod

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:125

## Extends

- [`RouteHandlerMethod`](RouteHandlerMethod.md)

## Constructors

### Constructor

> **new ErrorHandlerMethod**(`handler`, `method`, ...`args`): `ErrorHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:58

#### Parameters

##### handler

`object`

##### method

`string`

##### args

...`any`[]

#### Returns

`ErrorHandlerMethod`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`constructor`](RouteHandlerMethod.md#constructor)

### Constructor

> **new ErrorHandlerMethod**(`factory`, `name`, `method`, ...`args`): `ErrorHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:59

#### Parameters

##### factory

`Factory`

##### name

`string`

##### method

`string`

##### args

...`any`[]

#### Returns

`ErrorHandlerMethod`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`constructor`](RouteHandlerMethod.md#constructor)

## Properties

### factory

> `readonly` **factory**: `Factory` \| `null`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:50

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`factory`](RouteHandlerMethod.md#factory)

***

### name

> `readonly` **name**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:51

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`name`](RouteHandlerMethod.md#name)

***

### handler

> `readonly` **handler**: `object`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:52

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`handler`](RouteHandlerMethod.md#handler)

***

### method

> `readonly` **method**: `string`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:53

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`method`](RouteHandlerMethod.md#method)

***

### parameters

> **parameters**: [`MethodParameter`](MethodParameter.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:55

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`parameters`](RouteHandlerMethod.md#parameters)

***

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:56

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`argumentResolvers`](RouteHandlerMethod.md#argumentresolvers)

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:117

#### Returns

`string`

#### Inherited from

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`toString`](RouteHandlerMethod.md#tostring)

***

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, `error`, `handlerMethod`): `ModelAndView`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:126

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

`Route`

##### error

`Error`

##### handlerMethod

[`RouteHandlerMethod`](RouteHandlerMethod.md)

#### Returns

`ModelAndView`

#### Overrides

[`RouteHandlerMethod`](RouteHandlerMethod.md).[`invoke`](RouteHandlerMethod.md#invoke)
