[**@ndigo/flags v0.0.1**](../../README.md)

***

[@ndigo/flags](../../README.md) / [property-flag-provider](../README.md) / stableBucket

# Function: stableBucket()

> **stableBucket**(`flag`, `targetingKey`): `number`

Maps a flag name and targeting key to a stable bucket in `[0, 1)` by hashing
them together (FNV-1a), so percentage rollouts are deterministic per target
and independent of iteration order or process restarts.

## Parameters

### flag

`string`

### targetingKey

`string`

## Returns

`number`
