[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractNamedValueMethodArgumentResolver

# Abstract Class: AbstractNamedValueMethodArgumentResolver

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:30

Resolves a method parameter into an argument value from a given route.

## Extended by

- [`MatrixValueMethodArgumentResolver`](MatrixValueMethodArgumentResolver.md)
- [`QueryValueMethodArgumentResolver`](QueryValueMethodArgumentResolver.md)
- [`AbstractCookieValueMethodArgumentResolver`](../../../blue-platform-web/src/classes/AbstractCookieValueMethodArgumentResolver.md)

## Implements

- [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractNamedValueMethodArgumentResolver**(`factory?`): `AbstractNamedValueMethodArgumentResolver`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:33

#### Parameters

##### factory?

[`Factory`](../../../blue-factory/src/interfaces/Factory.md)

#### Returns

`AbstractNamedValueMethodArgumentResolver`

## Methods

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:37

#### Parameters

##### name

`string`

#### Returns

`void`

***

### resolveArgument()

> `abstract` **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:41

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### mapping

`any`

#### Returns

`any`

#### Implementation of

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md).[`resolveArgument`](../interfaces/HandlerMethodArgumentResolver.md#resolveargument)

***

### supportsParameter()

> `abstract` **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:42

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

#### Returns

`boolean`

#### Implementation of

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md).[`supportsParameter`](../interfaces/HandlerMethodArgumentResolver.md#supportsparameter)
