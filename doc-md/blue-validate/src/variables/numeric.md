[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / numeric

# Variable: numeric

> `const` **numeric**: (`params`) => (`value`, `context`) => `void`

Defined in: [packages/blue-validate/src/decorators.ts:549](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-549)

TC39 Stage 3 decorator that validates a property to be a numeric value.

## Parameters

### params?

`Record`\<`string`, `unknown`\> \| `DecoratorConfig`\<`Record`\<`string`, `unknown`\>\>

Optional configuration for the decorator.

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @numeric({ message: 'Must be a number' })
  value: unknown;
}
```
