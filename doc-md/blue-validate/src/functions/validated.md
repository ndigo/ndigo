[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / validated

# Function: validated()

> **validated**(`config?`): \<`T`\>(`target`, `context`) => `T`

Defined in: packages/blue-validate/src/decorators.ts:585

TC39 Stage 3 class decorator that enables validation for a class's fields.
When applied, it adds a `validate` method to the class prototype, allowing programmatic validation.

Groups are evaluated at the decorator level
regardless of backend, ensuring symmetric behavior.

## Parameters

### config?

[`ValidatedConfig`](../type-aliases/ValidatedConfig.md) = `{}`

Configuration for the class validation.

## Returns

A class decorator function.

\<`T`\>(`target`, `context`) => `T`

## Example

```ts
@validated({ backend: 'zod' })
class User {
  @email()
  email: string;
}
```
