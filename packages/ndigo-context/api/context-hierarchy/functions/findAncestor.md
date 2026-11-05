[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-hierarchy](../README.md) / findAncestor

# Function: findAncestor()

> **findAncestor**(`context`, `predicate`): [`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md) \| `undefined`

Find the first ancestor (excluding self) that matches `predicate`.

## Parameters

### context

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The starting context.

### predicate

(`context`) => `boolean`

Matching predicate.

## Returns

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md) \| `undefined`

The first matching ancestor, if found.
