[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / DataSource

# Interface: DataSource

Defined in: packages/blue-orm/src/data-source.ts:10

Represents a data source for managing entity stores.
It extends `Initializable` and `Destroyable` for lifecycle management.

## Extends

- `Initializable`.`Destroyable`

## Properties

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:3

#### Inherited from

`Destroyable.destroyed`

## Methods

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:4

#### Returns

`void`

#### Inherited from

`Destroyable.destroy`

***

### init()

> **init**(...`args`): `void`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:10

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Inherited from

`Initializable.init`

***

### getStore()

> **getStore**\<`T`\>(`entityName`): `Map`\<`unknown`, `T`\>

Defined in: packages/blue-orm/src/data-source.ts:17

Retrieves the store for a given entity name.

#### Type Parameters

##### T

`T`

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`Map`\<`unknown`, `T`\>

A Map representing the entity store.

#### Throws

If the store for the entity does not exist.

***

### hasStore()

> **hasStore**(`entityName`): `boolean`

Defined in: packages/blue-orm/src/data-source.ts:23

Checks if a store for the given entity name exists.

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`boolean`

`true` if the store exists, `false` otherwise.

***

### createStore()

> **createStore**(`entityName`): `void`

Defined in: packages/blue-orm/src/data-source.ts:28

Creates a new store for the given entity name if it doesn't already exist.

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-orm/src/data-source.ts:32

Clears all entity stores.

#### Returns

`void`
