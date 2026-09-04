[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / enumeration

# Variable: enumeration

> `const` **enumeration**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:493

TC39 Stage 3 decorator that validates a property's value against a predefined list of allowed values.

## Parameters

### params?

\{ `value`: `string` \| `string`[]; \} \| `DecoratorConfig`\<\{ `value`: `string` \| `string`[]; \}\>

Parameters for the enumeration constraint.

#### Type Literal

\{ `value`: `string` \| `string`[]; \}

Parameters for the enumeration constraint.

##### value

`string` \| `string`[]

A single allowed value or an array of allowed values.

***

`DecoratorConfig`\<\{ `value`: `string` \| `string`[]; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @enumeration({ value: ['red', 'green', 'blue'], message: 'Color must be red, green, or blue' })
  color: string;
}
```
