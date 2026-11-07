[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [conditional](../README.md) / whenBrowser

# Function: whenBrowser()

> **whenBrowser**(`target`, `context`): `void`

Marks a configuration class as browser-only.

## Parameters

### target

`Function`

The decorated class.

### context

`ClassDecoratorContext`

The decorator context.

## Returns

`void`

## Example

```ts
@whenBrowser
class WebAutoConfiguration {}
```
