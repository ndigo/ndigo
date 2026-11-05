[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameters](../README.md) / getParameterMap

# Function: getParameterMap()

> **getParameterMap**(`target`, `propertyKey`): [`ParameterMap`](../../parameter-types/type-aliases/ParameterMap.md) \| `undefined`

Read the raw parameter map declared on a method by `@parameters`.

## Parameters

### target

`unknown`

The class prototype or constructor.

### propertyKey

`string` \| `symbol`

The method name.

## Returns

[`ParameterMap`](../../parameter-types/type-aliases/ParameterMap.md) \| `undefined`

The name → extractor map, or `undefined` when not decorated.
