[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [conditional](../README.md) / whenProperty

# Function: whenProperty()

> **whenProperty**(`options`): (`target`, `context`) => `void`

Marks a configuration class as active only when an environment property is
present (and, when `havingValue` is set, matches it).

## Parameters

### options

[`WhenPropertyOptions`](../interfaces/WhenPropertyOptions.md)

Property condition options.

## Returns

(`target`, `context`) => `void`

## Example

```ts
@whenProperty({ name: 'app.management.enabled' })
class ManagementConfiguration {}
```
