[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AbstractNamedValueMethodArgumentResolver

# Abstract Class: AbstractNamedValueMethodArgumentResolver

Abstract base class for resolving method arguments from a named value.

Subclasses define how to:
* Obtain named value information for a method parameter
* Resolve names into argument values
* Handle missing argument values when argument values are required
* Optionally handle a resolved value

## Extended by

- [`MatrixValueMethodArgumentResolver`](MatrixValueMethodArgumentResolver.md)
- [`QueryValueMethodArgumentResolver`](QueryValueMethodArgumentResolver.md)
- [`PathValueMethodArgumentResolver`](PathValueMethodArgumentResolver.md)
- [`AttributeValueMethodArgumentResolver`](AttributeValueMethodArgumentResolver.md)
- [`RouteValueMethodArgumentResolver`](RouteValueMethodArgumentResolver.md)
- [`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md)

## Implements

- [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractNamedValueMethodArgumentResolver**(): `AbstractNamedValueMethodArgumentResolver`

#### Returns

`AbstractNamedValueMethodArgumentResolver`

## Methods

### handleMissingValue()

> **handleMissingValue**(`parameter`): `never`

Handles a missing argument value by throwing a
a MissingParameterError — a ParameterBindingError, so HTTP
error resolvers map it to 400 (Spring's
MissingServletRequestParameterException parity) instead of a 500
from a bare TypeError.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

The method parameter that could not be resolved.

#### Returns

`never`

#### Throws

if the argument is undefined or null.

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Resolves a method parameter into an argument value from a given route.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

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

#### Implementation of

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md).[`resolveArgument`](../interfaces/HandlerMethodArgumentResolver.md#resolveargument)

***

### supportsParameter()

> `abstract` **supportsParameter**(`parameter`): `boolean`

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Implementation of

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md).[`supportsParameter`](../interfaces/HandlerMethodArgumentResolver.md#supportsparameter)
