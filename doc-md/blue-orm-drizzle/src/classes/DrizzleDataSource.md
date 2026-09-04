[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm-drizzle/src](../README.md) / DrizzleDataSource

# Class: DrizzleDataSource

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:23

Drizzle-backed data source that maps `@blue/orm` entity metadata to SQL tables.

## Constructors

### Constructor

> **new DrizzleDataSource**(`options?`): `DrizzleDataSource`

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:29

#### Parameters

##### options?

[`DrizzleDataSourceOptions`](../interfaces/DrizzleDataSourceOptions.md) = `{}`

#### Returns

`DrizzleDataSource`

## Accessors

### db

#### Get Signature

> **get** **db**(): `LibSQLDatabase`

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:35

##### Returns

`LibSQLDatabase`

***

### client

#### Get Signature

> **get** **client**(): `Client`

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:39

##### Returns

`Client`

***

### url

#### Get Signature

> **get** **url**(): `string`

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:43

##### Returns

`string`

***

### initialized

#### Get Signature

> **get** **initialized**(): `boolean`

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:47

##### Returns

`boolean`

## Methods

### init()

> **init**(`entities`): `Promise`\<`void`\>

Defined in: packages/blue-orm-drizzle/src/drizzle-data-source.ts:51

#### Parameters

##### entities

`Constructable`[]

#### Returns

`Promise`\<`void`\>
