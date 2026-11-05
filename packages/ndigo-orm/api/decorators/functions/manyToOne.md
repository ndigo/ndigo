[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / manyToOne

# Function: manyToOne()

> **manyToOne**(`targetEntity`, `options?`): (`_value`, `context`) => `void`

Marks a class field as the "many" side of a many-to-one relation.

## Parameters

### targetEntity

() => [`ClassType`](#)

A zero-argument thunk returning the related entity class.

### options?

[`RelationOptions`](../interfaces/RelationOptions.md) = `{}`

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
