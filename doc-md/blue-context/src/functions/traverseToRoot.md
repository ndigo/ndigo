[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / traverseToRoot

# Function: traverseToRoot()

> **traverseToRoot**(`context`, `visitor`): `void`

Defined in: packages/blue-context/src/context-hierarchy.ts:159

Walk from `context` up to root (inclusive), invoking `visitor` for each node.

## Parameters

### context

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The starting context.

### visitor

(`context`) => `void`

A callback invoked for each visited context.

## Returns

`void`
