[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / generatedColumn

# Function: generatedColumn()

> **generatedColumn**(): (`_value`, `context`) => `void`

Decorator that marks a class property as a generated column.
This is typically used for auto-incrementing primary keys or other database-generated values.

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
class User {
  @primaryColumn()
  @generatedColumn()
  id: number;
}
```
