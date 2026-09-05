[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / entity

# Function: entity()

> **entity**(`tableName?`): \<`T`\>(`target`, `context`) => `T`

Defined in: [packages/blue-orm/src/decorators.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-38)

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
