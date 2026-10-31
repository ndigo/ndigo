[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / likeJobHandlerRegistry

# Function: likeJobHandlerRegistry()

> **likeJobHandlerRegistry**(`value`): `value is JobHandlerRegistry`

Structural type guard for [JobHandlerRegistry](../classes/JobHandlerRegistry.md) — the `like*`
convention used where a bean or option is verified before use (sibling of
[likeJobDriver](likeJobDriver.md)).

## Parameters

### value

`unknown`

The candidate value.

## Returns

`value is JobHandlerRegistry`

Whether it exposes the registry seam (`get` + `register`).

## Since

1.0.0
