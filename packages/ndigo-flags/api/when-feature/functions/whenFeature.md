[**@ndigo/flags v0.0.1**](../../README.md)

***

[@ndigo/flags](../../README.md) / [when-feature](../README.md) / whenFeature

# Function: whenFeature()

> **whenFeature**(`flag`): (`target`, `context`) => `void`

Marks a class or method as gated on a feature flag: the handler is only
reachable while the flag evaluates truthy.

```ts
@whenFeature('todo.dueDates')
@routeMapping('/todo/due')
async dueDates() { … }
```

The flag key is validated at decoration time (fail loud at definition).
A disallowed decorator kind throws.

## Parameters

### flag

`string`

The flag key (`[A-Za-z0-9._:-]+`); the local provider
  resolves it as `feature.<flag>`.

## Returns

The class or method decorator.

(`target`, `context`) => `void`
