[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / max

# Variable: max

> `const` **max**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:314

TC39 Stage 3 decorator that validates a numeric property to be less than or equal to a specified maximum value.

## Parameters

### params?

\{ `value`: `number`; \} \| `DecoratorConfig`\<\{ `value`: `number`; \}\>

Parameters for the max constraint.

#### Type Literal

\{ `value`: `number`; \}

Parameters for the max constraint.

##### value

`number`

The maximum allowed value.

***

`DecoratorConfig`\<\{ `value`: `number`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @max({ value: 100, message: 'Must be 100 or less' })
  score: number;
}
```
