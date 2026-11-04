[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / DrizzleDataSource

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

##### Returns

`Client`

***

### db

#### Get Signature

> **get** **db**(): `LibSQLDatabase`

##### Returns

`LibSQLDatabase`

***

### initialized

#### Get Signature

> **get** **initialized**(): `boolean`

##### Returns

`boolean`

***

### url

#### Get Signature

> **get** **url**(): `string`

##### Returns

`string`

## Methods

### init()

> **init**(`entities`): `Promise`\<`void`\>

#### Parameters

##### entities

`Constructable`[]

#### Returns

`Promise`\<`void`\>
