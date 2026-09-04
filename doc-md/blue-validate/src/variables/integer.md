[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / integer

# Variable: integer

> `const` **integer**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:540

TC39 Stage 3 decorator that validates a numeric property to be an integer.

## Parameters

### params?

`Record`\<`string`, `unknown`\> \| `DecoratorConfig`\<`Record`\<`string`, `unknown`\>\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @integer({ message: 'Must be an integer' })
  quantity: number;
}
```
