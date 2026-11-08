[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [request-part-argument-resolver](../README.md) / NodeRequestPartMethodArgumentResolver

# Class: NodeRequestPartMethodArgumentResolver

Node.js multipart JSON/text-part argument resolver (D-6 —
`@requestPart` parity).

Matches `requestPart(partName?, Target?)` (`MethodParameterType.REQUEST_PART`)
and reads the named part from `request.multipart.fields`. JSON parts parse
to an object (raw-text fallback); with a target constructor the parsed
object is copied into a real DTO instance, then the shared conversion +
Zod `convert` hook pipeline runs. Repeated parts (already collapsed to
`string[]` by AD-26) parse per element into an array. File parts are left
to `fileValue()`/`MultipartFile` — the resolver ignores them.

The part name is the extractor's folded client field (see
`toMethodParameter`): the explicit `requestPart('meta')` name, or the
method-argument name when inferred. A missing part resolves like any other
missing value.

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new NodeRequestPartMethodArgumentResolver**(): `NodeRequestPartMethodArgumentResolver`

#### Returns

`NodeRequestPartMethodArgumentResolver`

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

Resolves a request part onto the parameter (optionally targeting a DTO).

#### Parameters

##### parameter

`MethodParameter`

The method parameter.

##### route

[`Route`](#)

The current route.

##### mapping

`unknown`

The route mapping.

#### Returns

`unknown`

The bound value.

#### Overrides

`AbstractPlatformArgumentResolver.resolveArgument`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether this resolver supports request-part parameters.

#### Parameters

##### parameter

`MethodParameter`

The method parameter to test.

#### Returns

`boolean`

Whether the parameter type matches.

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
