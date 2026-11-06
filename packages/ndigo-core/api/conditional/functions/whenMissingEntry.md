[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [conditional](../README.md) / whenMissingEntry

# Function: whenMissingEntry()

> **whenMissingEntry**(`entryName`): (`target`, `context`) => `void`

Marks a configuration class as active only when an entry is NOT already
registered — the "provide your own override" guarantee for auto-configs.

## Parameters

### entryName

`string`

## Returns

(`target`, `context`) => `void`

## Example

```ts
@whenMissingEntry('metricsController')
class ManagementAutoConfiguration {}
```
