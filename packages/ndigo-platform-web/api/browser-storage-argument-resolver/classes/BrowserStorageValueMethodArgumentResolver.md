[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [browser-storage-argument-resolver](../README.md) / BrowserStorageValueMethodArgumentResolver

# Class: BrowserStorageValueMethodArgumentResolver

Browser storage argument resolver for `sessionStorage` and `localStorage`.

One parameterized resolver replaces the former per-storage classes: the
constructor takes the storage accessor, the `MethodParameterType` to match,
and the `Symbol.toStringTag` label, so the session/local registrations stay
distinguishable (D-2).

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new BrowserStorageValueMethodArgumentResolver**(`storage`, `type`, `tag`): `BrowserStorageValueMethodArgumentResolver`

Creates a browser storage argument resolver.

#### Parameters

##### storage

() => `Storage` \| `null`

Accessor returning the browser storage to read
  (`() => globalThis.sessionStorage` or `() => globalThis.localStorage`).

##### type

`MethodParameterType`

The parameter type this resolver supports.

##### tag

`string`

The `Symbol.toStringTag` label for this registration.

#### Returns

`BrowserStorageValueMethodArgumentResolver`

#### Overrides

`AbstractPlatformArgumentResolver.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

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

`MethodParameter`

The method parameter that could not be resolved.

#### Returns

`never`

#### Throws

if the argument is undefined or null.

#### Inherited from

`AbstractPlatformArgumentResolver.handleMissingValue`

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

`MethodParameter`

The method parameter being resolved.

##### route

[`Route`](#)

The current route.

##### mapping

`unknown`

The route handler mapping.

#### Returns

`unknown`

The resolved and converted value.

#### Inherited from

`AbstractPlatformArgumentResolver.resolveArgument`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Returns whether this resolver supports the configured storage parameter type.

#### Parameters

##### parameter

`MethodParameter`

The method parameter to test.

#### Returns

`boolean`

Whether the parameter type matches.

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
