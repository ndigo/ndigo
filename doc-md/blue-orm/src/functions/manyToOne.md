[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / manyToOne

# Function: manyToOne()

> **manyToOne**(`targetEntity`): (`_value`, `context`) => `void`

Defined in: packages/blue-orm/src/decorators.ts:158

Marks a class field as the "many" side of a many-to-one relation.

## Parameters

### targetEntity

() => `ClassType`

A zero-argument thunk returning the related entity class.

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class Book {
  @manyToOne(() => Author)
  author: Author;
}
```
