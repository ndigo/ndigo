[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [multipart-file-argument-resolver](../README.md) / NodeMultipartFileMethodArgumentResolver

# Class: NodeMultipartFileMethodArgumentResolver

Node.js multipart/form-data file-part argument resolver.

Matches `fileValue()` (`MethodParameterType.MULTIPART_FILE`) parameters and
reads the parsed parts from `request.multipart.files`. The part name is the
extractor's folded client field (see `toMethodParameter`): the explicit
`fileValue('field')` name, or the method-argument name when inferred.

A single upload binds to a lone file; several uploads under the same field
bind to an array — TypeScript types are erased at runtime, so arity is
disambiguated by part count. A missing part on a required parameter fails
like any other missing value (handled by the shared pipeline).

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new NodeMultipartFileMethodArgumentResolver**(): `NodeMultipartFileMethodArgumentResolver`

#### Returns

`NodeMultipartFileMethodArgumentResolver`

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

##### route

[`Route`](#)

##### mapping

`unknown`

#### Returns

`unknown`

#### Inherited from

`AbstractPlatformArgumentResolver.resolveArgument`

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

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
