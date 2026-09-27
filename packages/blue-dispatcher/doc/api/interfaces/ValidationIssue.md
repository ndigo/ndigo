[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / ValidationIssue

# Interface: ValidationIssue

A single failed check from a Zod schema parse.

Mirrors the stable subset of a Zod v4 issue: the failing path, human
message, and error code (`too_small`, `invalid_type`, `email`, …).

## Properties

### code

> `readonly` **code**: `string`

The Zod error code, e.g. `too_small`, `invalid_type`, `email`.

***

### message

> `readonly` **message**: `string`

The failure message.

***

### path

> `readonly` **path**: readonly `PropertyKey`[]

The failing path, e.g. `['title']` for a nested field.
