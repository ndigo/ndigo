[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [data-binding-argument-resolver](../README.md) / NodeDataBindingMethodArgumentResolver

# Class: NodeDataBindingMethodArgumentResolver

Node.js whole-source data-binding argument resolver.

Reads a whole wire source (the parsed `request.body` — form-urlencoded or
JSON — or `request.cookies`) and binds it into one nested object via
`DataBinder`, optionally through a target constructor
(`dataBinderValue('body', ProfileForm)` → a real `ProfileForm` instance),
then through the shared conversion + Zod `convert` hook pipeline of the
`AbstractDataBindingArgumentResolver` base.

## Extends

- `AbstractDataBindingArgumentResolver`

## Constructors

### Constructor

> **new NodeDataBindingMethodArgumentResolver**(): `NodeDataBindingMethodArgumentResolver`

Creates a whole-source data-binding resolver.

#### Returns

`NodeDataBindingMethodArgumentResolver`

#### Inherited from

`AbstractDataBindingArgumentResolver.constructor`

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

`AbstractDataBindingArgumentResolver.handleMissingValue`

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Delegates to the shared whole-source binding pipeline.

#### Parameters

##### parameter

`MethodParameter`

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

#### Inherited from

`AbstractDataBindingArgumentResolver.resolveArgument`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether the parameter binds one of this platform's whole sources.

#### Parameters

##### parameter

`MethodParameter`

The method parameter to check.

#### Returns

`boolean`

`true` when the parameter type matches a bindable source.

#### Inherited from

`AbstractDataBindingArgumentResolver.supportsParameter`
