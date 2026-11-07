[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [management-properties](../README.md) / resolveExposure

# Function: resolveExposure()

> **resolveExposure**(`include?`, `exclude?`): `ReadonlySet`\<`string`\>

Computes the served endpoint-id set from an exposure pair.

`'*'` in `include` expands to every known id; unknown ids are dropped
(the schema documents the vocabulary); `exclude` wins over `include`.

## Parameters

### include?

readonly `string`[] \| `undefined` = `DEFAULT_EXPOSURE`

The ids to serve (or `'*'`).

### exclude?

readonly `string`[] \| `undefined` = `[]`

The ids to withhold.

## Returns

`ReadonlySet`\<`string`\>

The served id set.

## Example

```ts
resolveExposure(['*'], ['env']); // every endpoint except 'env'
```
