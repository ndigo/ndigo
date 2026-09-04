[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / entry

# Function: entry()

> **entry**(`nameOrTarget?`, `maybeContext?`): `any`

Defined in: packages/blue-context/src/configuration.ts:219

Marks a method as a configuration entry factory.

## Parameters

### nameOrTarget?

`any`

Entry name or the decorated method target.

### maybeContext?

`ClassMethodDecoratorContext`\<`unknown`, (`this`, ...`args`) => `any`\>

Decorator context for legacy usage.

## Returns

`any`

A decorator when called with a name, or the legacy decorator result.
