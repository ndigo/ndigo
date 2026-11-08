[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [abstract-platform-resolver](../README.md) / AbstractDataBindingArgumentResolver

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

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`handleMissingValue`](AbstractPlatformArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Delegates to the shared whole-source binding pipeline.

#### Parameters

##### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

The method parameter being bound.

##### route

[`Route`](#)

The current route.

##### mapping

`unknown`

The route handler mapping.

#### Returns

`unknown`

The bound, converted, and validated value.

#### Overrides

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`resolveArgument`](AbstractPlatformArgumentResolver.md#resolveargument)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether the parameter binds one of this platform's whole sources.

#### Parameters

##### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

`true` when the parameter type matches a bindable source.

#### Overrides

[`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md).[`supportsParameter`](AbstractPlatformArgumentResolver.md#supportsparameter)
