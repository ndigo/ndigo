[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / postLoad

# Function: postLoad()

> **postLoad**(): (`_value`, `context`) => `void`

Defined in: packages/blue-orm/src/decorators.ts:248

Marks a method to be invoked by the `EntityManager` **after** an entity is loaded
from the data source.

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class User {
  @postLoad()
  onAfterLoad() {
    // initialise transient fields after load
  }
}
```
