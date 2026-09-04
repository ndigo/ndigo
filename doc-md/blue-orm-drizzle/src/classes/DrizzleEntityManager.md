[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm-drizzle/src](../README.md) / DrizzleEntityManager

# Class: DrizzleEntityManager

Defined in: packages/blue-orm-drizzle/src/drizzle-entity-manager.ts:9

## Constructors

### Constructor

> **new DrizzleEntityManager**(`dataSource`): `DrizzleEntityManager`

Defined in: packages/blue-orm-drizzle/src/drizzle-entity-manager.ts:12

#### Parameters

##### dataSource

[`DrizzleDataSource`](DrizzleDataSource.md)

#### Returns

`DrizzleEntityManager`

## Methods

### persist()

> **persist**\<`T`\>(`entity`): `Promise`\<`void`\>

Defined in: packages/blue-orm-drizzle/src/drizzle-entity-manager.ts:20

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`Promise`\<`void`\>

***

### find()

> **find**\<`T`\>(`entityClass`, `id`): `Promise`\<`T` \| `undefined`\>

Defined in: packages/blue-orm-drizzle/src/drizzle-entity-manager.ts:68

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

##### id

`unknown`

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### findAll()

> **findAll**\<`T`\>(`entityClass`): `Promise`\<`T`[]\>

Defined in: packages/blue-orm-drizzle/src/drizzle-entity-manager.ts:84

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

#### Returns

`Promise`\<`T`[]\>

***

### remove()

> **remove**\<`T`\>(`entity`): `Promise`\<`void`\>

Defined in: packages/blue-orm-drizzle/src/drizzle-entity-manager.ts:97

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`Promise`\<`void`\>
