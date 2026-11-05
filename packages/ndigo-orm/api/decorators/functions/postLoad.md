[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / postLoad

# Function: postLoad()

> **postLoad**(): (`_value`, `context`) => `void`

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
