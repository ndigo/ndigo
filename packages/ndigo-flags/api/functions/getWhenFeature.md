[**@ndigo/flags v0.0.1**](../README.md)

***

[@ndigo/flags](../README.md) / getWhenFeature

# Function: getWhenFeature()

> **getWhenFeature**(`target`, `methodName?`): `string` \| `undefined`

Reads the feature gate recorded by `@whenFeature`.

## Parameters

### target

`unknown`

The decorated class constructor or instance.

### methodName?

`string`

The decorated method name, when reading method-level
  metadata (preferred; falls back to class-level when `methodName` is
  omitted or the method carries no gate).

## Returns

`string` \| `undefined`

The flag key, or `undefined` when un-gated.
