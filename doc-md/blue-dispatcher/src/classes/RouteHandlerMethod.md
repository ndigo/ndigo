[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerMethod

# Class: RouteHandlerMethod

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:49

## Extended by

- [`ErrorHandlerMethod`](ErrorHandlerMethod.md)

## Implements

- [`HandlerMethod`](../interfaces/HandlerMethod.md)
- `Serializable`

## Constructors

### Constructor

> **new RouteHandlerMethod**(`handler`, `method`, ...`args`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:58

#### Parameters

##### handler

`object`

##### method

`string`

##### args

...`any`[]

#### Returns

`RouteHandlerMethod`

### Constructor

> **new RouteHandlerMethod**(`factory`, `name`, `method`, ...`args`): `RouteHandlerMethod`

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

`RouteHandlerMethod`

## Properties

### factory

> `readonly` **factory**: `Factory` \| `null`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:50

***

### name

> `readonly` **name**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:51

***

### handler

> `readonly` **handler**: `object`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:52

***

### method

> `readonly` **method**: `string`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:53

***

### parameters

> **parameters**: [`MethodParameter`](MethodParameter.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:55

***

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:56

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, ...`foo`): `ModelAndView`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:80

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

`Route`

##### foo

...`any`[]

#### Returns

`ModelAndView`

#### Implementation of

[`HandlerMethod`](../interfaces/HandlerMethod.md).[`invoke`](../interfaces/HandlerMethod.md#invoke)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-method.ts:117

#### Returns

`string`

#### Implementation of

`Serializable.toString`
