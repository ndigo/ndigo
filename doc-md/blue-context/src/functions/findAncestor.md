[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / findAncestor

# Function: findAncestor()

> **findAncestor**(`context`, `predicate`): [`ApplicationContext`](../interfaces/ApplicationContext.md) \| `undefined`

Defined in: packages/blue-context/src/context-hierarchy.ts:191

Find the first ancestor (excluding self) that matches `predicate`.

## Parameters

### context

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The starting context.

### predicate

(`context`) => `boolean`

Matching predicate.

## Returns

[`ApplicationContext`](../interfaces/ApplicationContext.md) \| `undefined`

The first matching ancestor, if found.
