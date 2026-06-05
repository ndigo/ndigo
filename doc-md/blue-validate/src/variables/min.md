[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / min

# Variable: min

> `const` **min**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:297

TC39 Stage 3 decorator that validates a numeric property to be greater than or equal to a specified minimum value.

## Parameters

### params?

\{ `value`: `number`; \} \| `DecoratorConfig`\<\{ `value`: `number`; \}\>

Parameters for the min constraint.

#### Type Literal

\{ `value`: `number`; \}

Parameters for the min constraint.

##### value

`number`

The minimum allowed value.

***

`DecoratorConfig`\<\{ `value`: `number`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @min({ value: 0, message: 'Must be non-negative' })
  age: number;
}
```
