[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / conditionalOnBrowser

# Function: conditionalOnBrowser()

> **conditionalOnBrowser**(`target`, `context`): `any`

Defined in: packages/blue-core/src/conditional.ts:79

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
@configuration
class WebAutoConfiguration { … }
```
