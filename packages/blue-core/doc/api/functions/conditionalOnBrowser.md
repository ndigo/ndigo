[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / conditionalOnBrowser

# Function: conditionalOnBrowser()

> **conditionalOnBrowser**(`target`, `context`): `void`

Marks a configuration class as browser-only.

## Parameters

### target

`Function`

### context

`ClassDecoratorContext`

## Returns

`void`

## Example

```ts
@conditionalOnBrowser
@class
class WebAutoConfiguration { … }
```
