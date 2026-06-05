[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / notBlank

# Variable: notBlank

> `const` **notBlank**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:455

TC39 Stage 3 decorator that validates a string property to not be null, undefined, or an empty string (after trimming).

## Parameters

### params?

`Record`\<`string`, `unknown`\> \| `DecoratorConfig`\<`Record`\<`string`, `unknown`\>\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @notBlank({ message: 'Field cannot be blank' })
  description: string;
}
```
