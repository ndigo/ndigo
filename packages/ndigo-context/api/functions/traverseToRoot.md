[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / traverseToRoot

# Function: traverseToRoot()

> **traverseToRoot**(`context`, `visitor`): `void`

Walk from `context` up to root (inclusive), invoking `visitor` for each node.

## Parameters

### context

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The starting context.

### visitor

(`context`) => `void`

A callback invoked for each visited context; its return value is ignored.

## Returns

`void`
