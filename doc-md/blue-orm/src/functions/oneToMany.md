[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / oneToMany

# Function: oneToMany()

> **oneToMany**(`targetEntity`): (`_value`, `context`) => `void`

Defined in: packages/blue-orm/src/decorators.ts:140

Marks a class field as the "one" side of a one-to-many relation.

## Parameters

### targetEntity

() => `ClassType`

A zero-argument thunk returning the related entity class.
  Using a thunk avoids circular-reference issues with forward-declared classes.

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
