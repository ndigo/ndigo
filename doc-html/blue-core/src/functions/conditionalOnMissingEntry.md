[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / conditionalOnMissingEntry

# Function: conditionalOnMissingEntry()

> **conditionalOnMissingEntry**(`entryName`): (`target`, `context`) => `any`

Defined in: [packages/blue-core/src/conditional.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-132)

Marks a configuration class as active only when an entry is NOT already
registered — the "provide your own override" guarantee for auto-configs.

## Parameters

### entryName

`string`

## Returns

(`target`, `context`) => `any`

## Example

```ts
@conditionalOnMissingEntry('metricsController')
@class
class ManagementAutoConfiguration { … }
```
