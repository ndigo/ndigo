[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerMethod

# Class: RouteHandlerMethod

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-47)

## Param

## Param

## Extended by

- [`ErrorHandlerMethod`](ErrorHandlerMethod.md)

## Implements

- [`HandlerMethod`](../interfaces/HandlerMethod.md)
- `Serializable`

## Constructors

### Constructor

> **new RouteHandlerMethod**(`handler`, `method`, ...`args`): `RouteHandlerMethod`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-56)

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

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-57)

#### Parameters

##### factory

[`Factory`](#)

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

> `readonly` **factory**: [`Factory`](#) \| `null`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-48)

***

### name

> `readonly` **name**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-49)

***

### handler

> `readonly` **handler**: `object`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-50)

***

### method

> `readonly` **method**: `string`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-51)

***

### parameters

> **parameters**: [`MethodParameter`](MethodParameter.md)[]

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-53)

***

### argumentResolvers

> **argumentResolvers**: [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-54)

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, ...`foo`): `ModelAndView`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:78](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-78)

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

##### foo

...`any`[]

#### Returns

`ModelAndView`

#### Implementation of

[`HandlerMethod`](../interfaces/HandlerMethod.md).[`invoke`](../interfaces/HandlerMethod.md#invoke)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/route-handler-method.ts:117](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-method.ts#lines-117)

#### Returns

`string`

#### Implementation of

`Serializable.toString`
