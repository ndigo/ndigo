[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [config-file-loader](../README.md) / mergeConfig

# Function: mergeConfig()

> **mergeConfig**(`base`, `override`): `JSONObject`

Recursively merges `override` into `base` (mutates a copy of `base`):
objects merge, scalars override, **arrays replace**.

## Parameters

### base

`JSONObject`

The lower-precedence configuration object.

### override

`JSONObject`

The object whose values win.

## Returns

`JSONObject`

A new object with `override` merged over `base`.

## Example

```ts
mergeConfig(
    { server: { port: 8080, hosts: ['a'] } },
    { server: { port: 9090, hosts: ['b'] } }
);
// { server: { port: 9090, hosts: ['b'] } }
```
