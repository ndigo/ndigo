[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [argument-resolver](../README.md) / RouteValueMethodArgumentResolver

# Class: RouteValueMethodArgumentResolver

Resolves route meta values: `pathValue()` binds the full matched path,
`methodValue()` binds the request HTTP method, and the request id is
available via `requestIdValue()`. Reads `route.path`/`route.method`/
`route.id` by the extractor's name (the ROUTE meta source).

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new RouteValueMethodArgumentResolver**(): `RouteValueMethodArgumentResolver`

#### Returns

`RouteValueMethodArgumentResolver`

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

Whether the parameter binds a route value.

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
