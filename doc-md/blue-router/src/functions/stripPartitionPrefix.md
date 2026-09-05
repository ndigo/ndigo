[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / stripPartitionPrefix

# Function: stripPartitionPrefix()

> **stripPartitionPrefix**(`path`, `prefix`): `string`

Defined in: [packages/blue-router/src/route-partition.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/route-partition.ts#lines-48)

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
