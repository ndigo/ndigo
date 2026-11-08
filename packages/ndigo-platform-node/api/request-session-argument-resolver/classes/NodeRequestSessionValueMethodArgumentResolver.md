[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [request-session-argument-resolver](../README.md) / NodeRequestSessionValueMethodArgumentResolver

# Class: NodeRequestSessionValueMethodArgumentResolver

Node.js request-session argument resolver.

Reads `request.session` — the server-side session bag populated by
middleware before dispatch (session persistence/restoration is an open
contract; see [NodeRequest.session](../../node-request/interfaces/NodeRequest.md#session)).

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new NodeRequestSessionValueMethodArgumentResolver**(): `NodeRequestSessionValueMethodArgumentResolver`

#### Returns

`NodeRequestSessionValueMethodArgumentResolver`

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

Whether this resolver supports request-session parameters.

#### Parameters

##### parameter

`MethodParameter`

The method parameter to test.

#### Returns

`boolean`

Whether the parameter type matches.

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
