[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / preUpdate

# Function: preUpdate()

> **preUpdate**(): (`_value`, `context`) => `void`

Defined in: packages/blue-orm/src/decorators.ts:270

Marks a method to be invoked by the `EntityManager` **before** an already-persisted
entity is updated (update path).

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class Article {
  @column()
  updatedAt: string;

  @preUpdate()
  onBeforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}
```
