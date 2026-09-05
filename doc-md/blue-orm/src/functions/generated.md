[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / generated

# Function: generated()

> **generated**(): (`_value`, `context`) => `void`

Defined in: [packages/blue-orm/src/decorators.ts:103](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-103)

Decorator that marks a class property as a generated column.
This is typically used for auto-incrementing primary keys or other database-generated values.

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
class User {
  @primaryColumn()
  @generated()
  id: number;
}
```
