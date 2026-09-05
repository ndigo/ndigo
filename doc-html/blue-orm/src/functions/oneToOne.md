[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / oneToOne

# Function: oneToOne()

> **oneToOne**(`targetEntity`): (`_value`, `context`) => `void`

Defined in: [packages/blue-orm/src/decorators.ts:201](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-201)

Marks a class field as a one-to-one relation.

## Parameters

### targetEntity

() => `ClassType`

A zero-argument thunk returning the related entity class.

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
