[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / manyToMany

# Function: manyToMany()

> **manyToMany**(`targetEntity`): (`_value`, `context`) => `void`

Defined in: [packages/blue-orm/src/decorators.ts:183](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-183)

Marks a class field as a many-to-many relation.

## Parameters

### targetEntity

() => `ClassType`

A zero-argument thunk returning the related entity class.

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
