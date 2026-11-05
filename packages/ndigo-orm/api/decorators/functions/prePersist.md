[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / prePersist

# Function: prePersist()

> **prePersist**(): (`_value`, `context`) => `void`

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
