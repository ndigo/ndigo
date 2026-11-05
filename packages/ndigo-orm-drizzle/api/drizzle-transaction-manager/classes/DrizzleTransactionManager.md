[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-transaction-manager](../README.md) / DrizzleTransactionManager

# Class: DrizzleTransactionManager

Executes `fn` inside an interactive libSQL transaction: everything `fn`
issues through the data source's client — raw statements, the Drizzle
database, the durable stores built on the same client — runs in the
transaction, and it is committed on success or rolled back on failure.

The boundary is bound to `fn`'s async context (`runInTransaction` in
`_transaction-scope.ts`), so statements from elsewhere — `@libsql/client`
0.18 pools connections, one per statement — keep running on their own
connections instead of joining it.

The transaction opens with `BEGIN IMMEDIATE` (`mode: 'write'`): with a pooled
client the write lock is claimed at BEGIN rather than upgraded on the first
write, which is the mode libSQL's own clients default to and what keeps a
concurrent writer from failing the upgrade mid-transaction.

Nested calls throw: `@transactional` already serializes the boundary
(DAT-F9), and a transaction owns one connection for its lifetime.

## Since

1.0.0

## Implements

- `TransactionManager`

## Constructors

### Constructor

> **new DrizzleTransactionManager**(`dataSource`): `DrizzleTransactionManager`

#### Parameters

##### dataSource

[`DrizzleDataSource`](../../drizzle-data-source/classes/DrizzleDataSource.md)

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
