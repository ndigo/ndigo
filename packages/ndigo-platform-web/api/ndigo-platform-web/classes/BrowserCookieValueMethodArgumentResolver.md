[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [ndigo-platform-web](../README.md) / BrowserCookieValueMethodArgumentResolver

# Class: BrowserCookieValueMethodArgumentResolver

Browser cookie argument resolver using `document.cookie` parsing.

Binds `cookieValue()` (no name → the whole parsed jar) and named cookie
values through the shared `AbstractCookieValueArgumentResolver` base.

## Extends

- `AbstractCookieValueArgumentResolver`

## Constructors

### Constructor

> **new BrowserCookieValueMethodArgumentResolver**(): `BrowserCookieValueMethodArgumentResolver`

Creates a cookie-value resolver.

#### Returns

`BrowserCookieValueMethodArgumentResolver`

#### Inherited from

`AbstractCookieValueArgumentResolver.constructor`

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

`AbstractCookieValueArgumentResolver.handleMissingValue`

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

##### route

[`Route`](#)

##### mapping

`unknown`

#### Returns

`unknown`

#### Inherited from

`AbstractCookieValueArgumentResolver.resolveArgument`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

`MethodParameter`

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Inherited from

`AbstractCookieValueArgumentResolver.supportsParameter`
