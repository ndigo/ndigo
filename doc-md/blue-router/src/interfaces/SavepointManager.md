[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / SavepointManager

# Interface: SavepointManager

Defined in: packages/blue-router/src/transaction-manager.ts:7

Defines an interface for managing savepoints within a transaction, allowing for rollback and release.

## Since

1.0.0

## Methods

### createSavepoint()

> **createSavepoint**(): `unknown`

Defined in: packages/blue-router/src/transaction-manager.ts:8

#### Returns

`unknown`

***

### releaseSavepoint()

> **releaseSavepoint**(`savepoint`): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:9

#### Parameters

##### savepoint

`unknown`

#### Returns

`void`

***

### rollbackToSavepoint()

> **rollbackToSavepoint**(`savepoint`): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:10

#### Parameters

##### savepoint

`unknown`

#### Returns

`void`
