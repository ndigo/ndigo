[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service-client](../README.md) / resolveCallBody

# Function: resolveCallBody()

> **resolveCallBody**(`method`, `args`): `unknown`

Builds the body for a call: the first object (non-`Request`/`Response`)
argument becomes JSON; otherwise no body is sent.

## Parameters

### method

`string`

The HTTP method.

### args

`unknown`[]

The method call arguments.

## Returns

`unknown`

The body payload, or `undefined` for no body.
