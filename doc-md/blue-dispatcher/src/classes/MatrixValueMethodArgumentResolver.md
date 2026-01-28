[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatrixValueMethodArgumentResolver

# Class: MatrixValueMethodArgumentResolver

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:68

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new MatrixValueMethodArgumentResolver**(`factory?`): `MatrixValueMethodArgumentResolver`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:33

#### Parameters

##### factory?

[`Factory`](../../../blue-factory/src/interfaces/Factory.md)

#### Returns

`MatrixValueMethodArgumentResolver`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`constructor`](AbstractNamedValueMethodArgumentResolver.md#constructor)

## Methods

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:37

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractNamedValueMethodArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:69

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### mapping

`any`

#### Returns

`any`

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](AbstractNamedValueMethodArgumentResolver.md#resolveargument)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:94

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

#### Returns

`boolean`

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
