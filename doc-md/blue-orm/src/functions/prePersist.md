[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / prePersist

# Function: prePersist()

> **prePersist**(): (`_value`, `context`) => `void`

Defined in: packages/blue-orm/src/decorators.ts:229

Marks a method to be invoked by the `EntityManager` **before** an entity is persisted
for the first time (insert path).

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class Note {
  @column()
  createdAt: string;

  @prePersist()
  onBeforePersist() {
    this.createdAt = new Date().toISOString();
  }
}
```
