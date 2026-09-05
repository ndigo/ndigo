[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / conditionalOnBrowser

# Function: conditionalOnBrowser()

> **conditionalOnBrowser**(`target`, `context`): `any`

Defined in: [packages/blue-core/src/conditional.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-74)

Marks a configuration class as browser-only.

## Parameters

### target

`any`

### context

`ClassDecoratorContext`

## Returns

`any`

## Example

```ts
@conditionalOnBrowser
@class
class WebAutoConfiguration { … }
```
