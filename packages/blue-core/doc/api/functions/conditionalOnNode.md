[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / conditionalOnNode

# Function: conditionalOnNode()

> **conditionalOnNode**(`target`, `context`): `void`

Marks a configuration class as node-only.

## Parameters

### target

`Function`

### context

`ClassDecoratorContext`

## Returns

`void`

## Example

```ts
@conditionalOnNode
@class
class NodeAutoConfiguration { … }
```
