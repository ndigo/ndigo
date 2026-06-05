[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / email

# Variable: email

> `const` **email**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:444

TC39 Stage 3 decorator that validates a string property to be a valid email address.

## Parameters

### params?

`Record`\<`string`, `unknown`\> \| `DecoratorConfig`\<`Record`\<`string`, `unknown`\>\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @email({ message: 'Invalid email format' })
  userEmail: string;
}
```
