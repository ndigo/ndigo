[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / primaryColumn

# Function: primaryColumn()

> **primaryColumn**(): (`value`, `context`) => `void`

Defined in: packages/blue-orm/src/decorators.ts:77

Decorator that marks a class property as the primary column of the entity.
This implicitly also marks it as a regular column.

## Returns

(`value`, `context`) => `void`

## Example

```typescript
class User {
  @primaryColumn()
  id: number;
}
```
