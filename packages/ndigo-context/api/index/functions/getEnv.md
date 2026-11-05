[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [index](../README.md) / getEnv

# Function: getEnv()

> **getEnv**(`name`, `fallback?`): `string` \| `undefined`

Reads an environment variable, returning `fallback` when the variable is
unset. The single accessor for direct `process.env` reads (C-14): it is
safe in environments without a `process` global (browser/worker bundles),
where the fallback (or `undefined`) is returned instead of throwing.

A value set to the empty string is preserved — only a missing variable
triggers the fallback (node `??` semantics).

## Parameters

### name

`string`

The environment variable name.

### fallback?

`string`

Value returned when the variable is unset.

## Returns

`string` \| `undefined`

The variable value, or `fallback` when unset.
