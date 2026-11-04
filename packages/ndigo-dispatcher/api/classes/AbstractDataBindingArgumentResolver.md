[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AbstractDataBindingArgumentResolver

# Abstract Class: AbstractDataBindingArgumentResolver

Shared base for whole-source data-binding resolvers (`dataBinderValue`,
D-3). The browser and Node resolvers had the same `resolveArgument`
override, the same never-called `resolveName` stub, and the same
bindable-source `supportsParameter` check — the only platform knowledge is
the source table and the source lookup, which subclasses declare.

## See

[AbstractPlatformArgumentResolver.resolveBoundArgument](#)

## Extends

- [`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractDataBindingArgumentResolver**(): `AbstractDataBindingArgumentResolver`

Creates a whole-source data-binding resolver.

#### Returns

`AbstractDataBindingArgumentResolver`

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

#### Overrides

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
