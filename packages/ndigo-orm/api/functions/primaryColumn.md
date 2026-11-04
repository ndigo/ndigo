[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / primaryColumn

# Function: primaryColumn()

> **primaryColumn**(): (`value`, `context`) => `void`

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
