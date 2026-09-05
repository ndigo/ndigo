[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / postRemove

# Function: postRemove()

> **postRemove**(): (`_value`, `context`) => `void`

Defined in: [packages/blue-orm/src/decorators.ts:296](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-296)

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
