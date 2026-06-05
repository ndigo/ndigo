[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / range

# Variable: range

> `const` **range**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:332

TC39 Stage 3 decorator that validates a numeric property to be within a specified range (inclusive).

## Parameters

### params?

\{ `min?`: `number`; `max?`: `number`; \} \| `DecoratorConfig`\<\{ `min?`: `number`; `max?`: `number`; \}\>

Parameters for the range constraint.

#### Type Literal

\{ `min?`: `number`; `max?`: `number`; \}

Parameters for the range constraint.

##### min?

`number`

The minimum allowed value.

##### max?

`number`

The maximum allowed value.

***

`DecoratorConfig`\<\{ `min?`: `number`; `max?`: `number`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @range({ min: 1, max: 5, message: 'Must be between 1 and 5' })
  level: number;
}
```
