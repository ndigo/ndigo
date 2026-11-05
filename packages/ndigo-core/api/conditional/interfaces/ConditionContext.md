[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [conditional](../README.md) / ConditionContext

# Interface: ConditionContext

The runtime surface an active-condition evaluation needs: the environment
(for property conditions) and the entry registry (for missing-entry
conditions). Supplied by the bootstrap as it registers sources.

## Methods

### acceptsProfiles()?

> `optional` **acceptsProfiles**(`expression`): `boolean`

Whether a profile expression matches the effective active set.

#### Parameters

##### expression

`string`

The profile expression (`dev`, `!prod`, `a & b`).

#### Returns

`boolean`

`true` when the expression matches.

***

### getProperty()

> **getProperty**(`key`): `unknown`

Resolve a configuration property.

#### Parameters

##### key

`string`

The property key.

#### Returns

`unknown`

The property value, or `undefined` when absent.

***

### hasValue()

> **hasValue**(`name`): `boolean`

Whether an entry with the given name is already registered.

#### Parameters

##### name

`string`

The entry name.

#### Returns

`boolean`

`true` when the entry exists.
