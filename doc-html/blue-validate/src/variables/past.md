[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / past

# Variable: past

> `const` **past**: (`params`) => (`value`, `context`) => `void`

Defined in: [packages/blue-validate/src/decorators.ts:425](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-425)

TC39 Stage 3 decorator that validates a date property to be in the past.

## Parameters

### params?

\{ `format?`: `string`; \} \| `DecoratorConfig`\<\{ `format?`: `string`; \}\>

Parameters for the past constraint.

#### Type Literal

\{ `format?`: `string`; \}

Parameters for the past constraint.

##### format?

`string`

Optional date format string (e.g., 'YYYY-MM-DD').

***

`DecoratorConfig`\<\{ `format?`: `string`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @past({ message: 'Date must be in the past' })
  birthDate: Date;
}
```
