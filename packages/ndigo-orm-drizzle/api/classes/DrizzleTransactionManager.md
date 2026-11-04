[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / DrizzleTransactionManager

# Class: DrizzleTransactionManager

Executes `fn` inside a BEGIN/COMMIT/ROLLBACK transaction on the libSQL
connection. When `fn` rejects, the transaction is rolled back and the
original error is rethrown.

Nested calls throw: `@transactional` already serializes the boundary, and a
SQL connection can only hold one open transaction.

## Since

1.0.0

## Implements

- `TransactionManager`

## Constructors

### Constructor

> **new DrizzleTransactionManager**(`dataSource`): `DrizzleTransactionManager`

#### Parameters

##### dataSource

[`DrizzleDataSource`](DrizzleDataSource.md)

The Drizzle data source whose connection is
  bracketed by the transaction.

#### Returns

`DrizzleTransactionManager`

## Methods

### isActive()

> **isActive**(): `boolean`

#### Returns

`boolean`

#### Inherit Doc

#### Implementation of

`TransactionManager.isActive`

***

### run()

> **run**\<`T`\>(`fn`): `Promise`\<`T`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `T` \| `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

#### Inherit Doc

#### Implementation of

`TransactionManager.run`
