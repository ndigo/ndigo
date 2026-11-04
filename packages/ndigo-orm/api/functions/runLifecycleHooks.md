[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / runLifecycleHooks

# Function: runLifecycleHooks()

> **runLifecycleHooks**\<`T`\>(`entity`, `event`): `void`

Invokes the hooks registered for `event` on the entity's class, in
declaration order, bound to the entity instance. Hooks whose method is
missing at runtime are skipped.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### entity

`T`

The entity instance whose hooks run.

### event

[`LifecycleEvent`](../type-aliases/LifecycleEvent.md)

The lifecycle event (e.g. `'prePersist'`).

## Returns

`void`
