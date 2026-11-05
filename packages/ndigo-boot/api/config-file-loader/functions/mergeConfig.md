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

### override

`JSONObject`

## Returns

`JSONObject`
