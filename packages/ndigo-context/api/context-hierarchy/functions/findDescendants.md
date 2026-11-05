[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-hierarchy](../README.md) / findDescendants

# Function: findDescendants()

> **findDescendants**(`context`, `predicate`): [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)[]

Find descendants (excluding root `context`) that match `predicate`.

## Parameters

### context

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The subtree root.

### predicate

(`context`) => `boolean`

Matching predicate.

## Returns

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)[]

Matching descendants.
