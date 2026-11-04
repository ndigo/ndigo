[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / entity

# Function: entity()

> **entity**(`tableName?`): \<`T`\>(`target`, `context`) => `T`

Decorator that marks a class as an entity.
It can optionally specify a custom table name for the entity.

## Parameters

### tableName?

`string`

The custom table name for the entity (optional).

## Returns

\<`T`\>(`target`, `context`) => `T`

## Example

```typescript
@entity('users')
class User {
  // ...
}
```
