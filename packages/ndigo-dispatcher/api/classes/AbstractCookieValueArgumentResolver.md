[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AbstractCookieValueArgumentResolver

# Abstract Class: AbstractCookieValueArgumentResolver

Shared base for cookie-value resolvers: the whole-jar case
(`cookieValue()` with no name) and the cookie parameter match were
duplicated across the browser and Node resolvers, which differed only in
how the cookie jar is read.

## Extends

- [`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractCookieValueArgumentResolver**(): `AbstractCookieValueArgumentResolver`

Creates a cookie-value resolver.

#### Returns

`AbstractCookieValueArgumentResolver`

#### Overrides

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`constructor`](AbstractPlatformArgumentResolver.md#constructor)

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

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`handleMissingValue`](AbstractPlatformArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Resolves and converts a method argument value.

Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → extractor validation → nil check.

The `parameter.convert` hook (installed by `validatedBy` for Zod
validation, AD-07) runs after type conversion so schemas see coerced
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

#### Inherited from

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`resolveArgument`](AbstractPlatformArgumentResolver.md#resolveargument)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Overrides

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`supportsParameter`](AbstractPlatformArgumentResolver.md#supportsparameter)
