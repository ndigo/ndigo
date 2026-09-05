[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / findDescendants

# Function: findDescendants()

> **findDescendants**(`context`, `predicate`): [`ApplicationContext`](../interfaces/ApplicationContext.md)[]

Defined in: [packages/blue-context/src/context-hierarchy.ts:219](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-219)

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
