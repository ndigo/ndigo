[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / digits

# Variable: digits

> `const` **digits**: (`params`) => (`value`, `context`) => `void`

Defined in: [packages/blue-validate/src/decorators.ts:476](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-476)

TC39 Stage 3 decorator that validates a numeric property to have a specific number of integer and fraction digits.

## Parameters

### params?

\{ `integer`: `number`; `fraction`: `number`; \} \| `DecoratorConfig`\<\{ `integer`: `number`; `fraction`: `number`; \}\>

Parameters for the digits constraint.

#### Type Literal

\{ `integer`: `number`; `fraction`: `number`; \}

Parameters for the digits constraint.

##### integer

`number`

The exact number of integer digits allowed.

##### fraction

`number`

The exact number of fraction digits allowed.

***

`DecoratorConfig`\<\{ `integer`: `number`; `fraction`: `number`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @digits({ integer: 3, fraction: 2, message: 'Must have 3 integer and 2 fraction digits' })
  price: number;
}
```
