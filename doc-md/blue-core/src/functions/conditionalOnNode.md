[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / conditionalOnNode

# Function: conditionalOnNode()

> **conditionalOnNode**(`target`, `context`): `any`

Defined in: packages/blue-core/src/conditional.ts:62

Marks a configuration class as node-only.

## Parameters

### target

`any`

### context

`ClassDecoratorContext`

## Returns

`any`

## Example

```ts
@conditionalOnNode
@configuration
class NodeAutoConfiguration { … }
```
