[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / postRemove

# Function: postRemove()

> **postRemove**(): (`_value`, `context`) => `void`

Marks a method to be invoked by the `EntityManager` **after** an entity has been
removed from the data source.

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class Session {
  @postRemove()
  onAfterRemove() {
    // clean up associated resources
  }
}
```
