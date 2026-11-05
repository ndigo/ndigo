[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [argument-resolver](../README.md) / QueryValueMethodArgumentResolver

# Class: QueryValueMethodArgumentResolver

Resolves method arguments from query parameters.

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new QueryValueMethodArgumentResolver**(): `QueryValueMethodArgumentResolver`

#### Returns

`QueryValueMethodArgumentResolver`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`constructor`](AbstractNamedValueMethodArgumentResolver.md#constructor)

## Methods

### handleMissingValue()

> **handleMissingValue**(`parameter`): `never`

Handles a missing argument value by throwing a
a MissingParameterError — a ParameterBindingError, so HTTP
error resolvers map it to 400 (the reference framework's
MissingServletRequestParameterException parity) instead of a 500
from a bare TypeError.

#### Parameters

##### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

The method parameter that could not be resolved.

#### Returns

`never`

#### Throws

if the argument is undefined or null.

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractNamedValueMethodArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Resolves a method parameter into an argument value from a given route.

#### Parameters

##### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

The method parameter to resolve.

##### route

[`Route`](#)

The current route.

##### mapping

`unknown`

The route handler mapping.

#### Returns

`unknown`

The resolved argument value, or `null` if not resolvable.

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](AbstractNamedValueMethodArgumentResolver.md#resolveargument)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
