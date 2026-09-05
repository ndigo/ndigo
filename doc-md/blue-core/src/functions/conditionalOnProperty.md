[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / conditionalOnProperty

# Function: conditionalOnProperty()

> **conditionalOnProperty**(`options`): (`target`, `context`) => `any`

Defined in: packages/blue-core/src/conditional.ts:120

Marks a configuration class as active only when an environment property is
present (and, when `havingValue` is set, matches it).

## Parameters

### options

[`ConditionalOnPropertyOptions`](../interfaces/ConditionalOnPropertyOptions.md)

## Returns

(`target`, `context`) => `any`

## Example

```ts
@conditionalOnProperty({ name: 'app.management.enabled' })
@configuration
class ManagementConfiguration { … }
```
