[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / validated

# Function: validated()

> **validated**(`config?`): \<`T`\>(`target`, `context`) => `T`

Defined in: packages/blue-validate/src/decorators.ts:514

TC39 Stage 3 class decorator that enables validation for a class's fields.
When applied, it adds a `validate` method to the class prototype, allowing programmatic validation.

## Parameters

### config?

Configuration for the class validation.

#### groups?

`symbol`[]

Default validation groups to apply when `validate` is called without explicit groups.

## Returns

A class decorator function.

\<`T`\>(`target`, `context`) => `T`

## Example

```ts
@validated()
class User {
  @notBlank()
  firstName: string;

  @email()
  email: string;

  validateUser() {
    const result = this.validate();
    if (!result.isValid) {
      console.error('Validation failed for:', result.failedProperties);
    }
  }
}
```
