[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / length

# Variable: length

> `const` **length**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:412

TC39 Stage 3 decorator that validates the length of a string or array property.

## Parameters

### params?

\{ `min?`: `number`; `max?`: `number`; `value?`: `number`; \} \| `DecoratorConfig`\<\{ `min?`: `number`; `max?`: `number`; `value?`: `number`; \}\>

Parameters for the length constraint.

#### Type Literal

\{ `min?`: `number`; `max?`: `number`; `value?`: `number`; \}

Parameters for the length constraint.

##### min?

`number`

The minimum allowed length.

##### max?

`number`

The maximum allowed length.

##### value?

`number`

An exact allowed length.

***

`DecoratorConfig`\<\{ `min?`: `number`; `max?`: `number`; `value?`: `number`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @length({ min: 5, max: 20, message: 'Name must be between 5 and 20 characters' })
  name: string;
}
```
