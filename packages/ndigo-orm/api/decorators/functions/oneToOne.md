[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / oneToOne

# Function: oneToOne()

> **oneToOne**(`targetEntity`, `options?`): (`_value`, `context`) => `void`

Marks a class field as a one-to-one relation.

## Parameters

### targetEntity

() => [`ClassType`](#)

A zero-argument thunk returning the related entity class.

### options?

[`RelationOptions`](../interfaces/RelationOptions.md) = `{}`

Optional join-column overrides.

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class UserProfile {
  @oneToOne(() => User)
  user: User;
}
```
