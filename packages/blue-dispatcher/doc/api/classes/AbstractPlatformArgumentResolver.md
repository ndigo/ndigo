[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractPlatformArgumentResolver

# Abstract Class: AbstractPlatformArgumentResolver

Shared base class for platform argument resolvers.

Eliminates the 11 copies of the `resolveArgument` converter pipeline
that were previously duplicated across `@blue/platform-web` and
`@blue/platform-node`.

Subclasses only need to implement:
- `resolveName()` — where to fetch the raw value
- `supportsParameter()` — which `MethodParameterType` to match

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractPlatformArgumentResolver**(`convertFn`): `AbstractPlatformArgumentResolver`

Creates a platform argument resolver.

#### Parameters

##### convertFn

[`ConvertArgumentValueFn`](../type-aliases/ConvertArgumentValueFn.md)

Platform-specific `convertArgumentValue` function.

#### Returns

`AbstractPlatformArgumentResolver`

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`constructor`](AbstractNamedValueMethodArgumentResolver.md#constructor)

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

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractNamedValueMethodArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Resolves and converts a method argument value.

Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → extractor validation → nil check.

The `parameter.convert` hook (installed by `validatedBy` for Zod
validation, AD-7) runs after type conversion so schemas see coerced
values. Without this invocation the hook was dead on every resolver
extending this base — only the BIND path invoked it.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

##### route

[`Route`](#)

##### mapping

`unknown`

#### Returns

`unknown`

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](AbstractNamedValueMethodArgumentResolver.md#resolveargument)

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

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
