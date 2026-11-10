[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/app-scripts](../README.md) / CapturedRun

# Interface: CapturedRun

The captured outcome of a one-shot app script.

## Properties

### exitCode

> `readonly` **exitCode**: `number`

The child's exit code (`128 + signal` when killed, `127` when missing).

***

### stderr

> `readonly` **stderr**: `string`

Everything the child wrote to stderr.

***

### stdout

> `readonly` **stdout**: `string`

Everything the child wrote to stdout.
