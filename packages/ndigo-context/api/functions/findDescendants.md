[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / findDescendants

# Function: findDescendants()

> **findDescendants**(`context`, `predicate`): [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

Find descendants (excluding root `context`) that match `predicate`.

## Parameters

### context

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The subtree root.

### predicate

(`context`) => `boolean`

Matching predicate.

## Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md)[]

Matching descendants.
