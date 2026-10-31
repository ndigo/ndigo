[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / deriveKey

# Function: deriveKey()

> **deriveKey**(`path`, `name?`): `string`

Key derivation for route patterns.

## Parameters

### path

`string`

The route pattern (e.g. "/users", "/{id}", "/").

### name?

`string`

Optional explicit name from `@routeMapping({ name: '...' })`.

## Returns

`string`

The derived key (e.g. "users", "byId", "index").
