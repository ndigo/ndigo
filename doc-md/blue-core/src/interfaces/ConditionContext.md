[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ConditionContext

# Interface: ConditionContext

Defined in: [packages/blue-core/src/conditional.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-33)

The runtime surface an active-condition evaluation needs: the environment
(for property conditions) and the entry registry (for missing-entry
conditions). Supplied by the bootstrap as it registers sources.

## Methods

### getProperty()

> **getProperty**(`key`): `unknown`

Defined in: [packages/blue-core/src/conditional.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-40)

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

Defined in: [packages/blue-core/src/conditional.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-47)

Whether an entry with the given name is already registered.

#### Parameters

##### name

`string`

The entry name.

#### Returns

`boolean`

`true` when the entry exists.
