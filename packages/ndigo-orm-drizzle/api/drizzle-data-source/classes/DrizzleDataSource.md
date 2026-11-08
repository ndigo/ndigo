[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-data-source](../README.md) / DrizzleDataSource

# Class: DrizzleDataSource

Drizzle-backed data source that maps `@ndigo/orm` entity metadata to SQL tables.

## Constructors

### Constructor

> **new DrizzleDataSource**(`options?`): `DrizzleDataSource`

#### Parameters

##### options?

[`DrizzleDataSourceOptions`](../interfaces/DrizzleDataSourceOptions.md) = `{}`

#### Returns

`DrizzleDataSource`

## Accessors

### client

#### Get Signature

> **get** **client**(): `Client`

The underlying scoped libSQL client.

##### Returns

`Client`

***

### db

#### Get Signature

> **get** **db**(): `LibSQLDatabase`

The Drizzle database.

##### Returns

`LibSQLDatabase`

***

### initialized

#### Get Signature

> **get** **initialized**(): `boolean`

Whether the schema has been initialized.

##### Returns

`boolean`

***

### url

#### Get Signature

> **get** **url**(): `string`

The configured connection URL.

##### Returns

`string`

## Methods

### init()

> **init**(`entities`): `Promise`\<`void`\>

Creates the tables for the given entities (idempotent).

#### Parameters

##### entities

`Constructable`[]

The entity classes to provision.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the tables exist.
