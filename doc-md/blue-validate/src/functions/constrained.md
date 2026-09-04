[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / constrained

# Function: constrained()

> **constrained**(`config`): (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:327

TC39 Stage 3 decorator that applies a named validation constraint to a class field.
This decorator allows for dynamic application of any registered constraint.

## Parameters

### config

`ConstrainedDecoratorParams`

Configuration for the constraint, including its name and parameters.

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @constrained({ constraint: 'Min', params: { value: 10 }, message: 'Value must be at least 10' })
  myField: number;
}
```
