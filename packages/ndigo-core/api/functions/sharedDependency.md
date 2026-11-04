[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / sharedDependency

# Function: sharedDependency()

> **sharedDependency**(`options?`): (`target`, `context`) => `Function`

Class decorator that marks an entry as a shell-managed shared dependency.

When a child (feature) context attempts to register a `@sharedDependency` entry,
the factory skips registration and resolves the entry from the parent chain instead.

## Parameters

### options?

[`SharedOptions`](../interfaces/SharedOptions.md)

## Returns

(`target`, `context`) => `Function`

## Example

```ts
@sharedDependency({ version: '1.2.0' })
class TelemetryService { … }
```
