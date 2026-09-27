[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / oneToMany

# Function: oneToMany()

> **oneToMany**(`targetEntity`, `options?`): (`_value`, `context`) => `void`

Marks a class field as the "one" side of a one-to-many relation.

## Parameters

### targetEntity

() => [`ClassType`](#)

A zero-argument thunk returning the related entity class.
  Using a thunk avoids circular-reference issues with forward-declared classes.

### options?

[`RelationOptions`](../interfaces/RelationOptions.md) = `{}`

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
@entity()
class Author {
  @primaryColumn()
  id: number;

  @oneToMany(() => Book)
  books: Book[];
}
```
