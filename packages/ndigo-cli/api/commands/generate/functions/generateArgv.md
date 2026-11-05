[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/generate](../README.md) / generateArgv

# Function: generateArgv()

> **generateArgv**(`kind`, `flags`): `string`[]

Builds the nx argv for a generator kind from the parsed flags — the
unit-testable seam (BLK-3). Only flags the kind's schema declares are
forwarded; boolean flags become a bare `--flag`.

## Parameters

### kind

`string`

The generator kind.

### flags

[`GenerateFlags`](../interfaces/GenerateFlags.md)

The parsed flags.

## Returns

`string`[]

The argv appended to `exec nx g @ndigo/generators:<kind>`.
