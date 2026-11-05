[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / manyToMany

# Function: manyToMany()

> **manyToMany**(`targetEntity`, `options?`): (`_value`, `context`) => `void`

Marks a class field as a many-to-many relation.

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
class Student {
  @manyToMany(() => Course)
  courses: Course[];
}
```
