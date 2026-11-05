[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/new](../README.md) / newAppArgv

# Function: newAppArgv()

> **newAppArgv**(`name`, `flags`): `string`[]

Builds the generator argv for `ndigo new` from the parsed flags — the
unit-testable seam. Only flags the `app` schema declares are forwarded;
`--name` is always present, and `--dry-run` previews the file plan
without writing anything.

## Parameters

### name

`string`

The app slug (kebab-case).

### flags

[`NewAppFlags`](../interfaces/NewAppFlags.md)

The parsed flags.

## Returns

`string`[]

The argv appended to `exec nx g @ndigo/generators:app`.
