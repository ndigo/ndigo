[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / url

# Variable: url

> `const` **url**: (`params`) => (`value`, `context`) => `void`

Defined in: [packages/blue-validate/src/decorators.ts:527](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-527)

TC39 Stage 3 decorator that validates a string property to be a valid URL.

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
  @url({ message: 'Invalid URL format' })
  website: string;
}
```
