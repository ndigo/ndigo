[**@ndigo/router v0.0.1**](../README.md)

***

[@ndigo/router](../README.md) / stripPartitionPrefix

# Function: stripPartitionPrefix()

> **stripPartitionPrefix**(`path`, `prefix`): `string`

Strip a shell partition prefix from a full route path to produce feature-local route.

## Parameters

### path

`string`

The full shell route path.

### prefix

`string`

The feature partition prefix.

## Returns

`string`

The feature-local route (always rooted with `/`).
