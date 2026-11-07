[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [conditional](../README.md) / whenNode

# Function: whenNode()

> **whenNode**(`target`, `context`): `void`

Marks a configuration class as node-only.

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
@whenNode
class NodeAutoConfiguration {}
```
