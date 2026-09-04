[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / deriveKey

# Function: deriveKey()

> **deriveKey**(`path`, `name?`): `string`

Defined in: packages/blue-router/src/route-registry.ts:26

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
