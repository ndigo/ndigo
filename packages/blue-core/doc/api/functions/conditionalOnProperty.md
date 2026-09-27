[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / conditionalOnProperty

# Function: conditionalOnProperty()

> **conditionalOnProperty**(`options`): (`target`, `context`) => `void`

Marks a configuration class as active only when an environment property is
present (and, when `havingValue` is set, matches it).

## Parameters

### options

[`ConditionalOnPropertyOptions`](../interfaces/ConditionalOnPropertyOptions.md)

## Returns

(`target`, `context`) => `void`

## Example

```ts
@conditionalOnProperty({ name: 'app.management.enabled' })
@class
class ManagementConfiguration { … }
```
