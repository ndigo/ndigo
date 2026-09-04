[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / shared

# Function: shared()

> **shared**(`options?`): (`target`, `context`) => `Function`

Defined in: packages/blue-core/src/shared.ts:35

Class decorator that marks a bean as a shell-managed shared dependency.

When a child (feature) context attempts to register a `@shared` bean,
the factory skips registration and resolves the bean from the parent chain instead.

## Parameters

### options?

[`SharedOptions`](../interfaces/SharedOptions.md)

## Returns

(`target`, `context`) => `Function`

## Example

```ts
@shared({ version: '1.2.0' })
class TelemetryService { … }
```
