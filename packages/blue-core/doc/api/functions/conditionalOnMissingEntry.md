[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / conditionalOnMissingEntry

# Function: conditionalOnMissingEntry()

> **conditionalOnMissingEntry**(`entryName`): (`target`, `context`) => `void`

Marks a configuration class as active only when an entry is NOT already
registered — the "provide your own override" guarantee for auto-configs.

## Parameters

### entryName

`string`

## Returns

(`target`, `context`) => `void`

## Example

```ts
@conditionalOnMissingEntry('metricsController')
@class
class ManagementAutoConfiguration { … }
```
