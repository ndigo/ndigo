[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / DataSource

# Interface: DataSource

Represents a data source for managing entity stores.
It extends `Initializable` and `Destroyable` for lifecycle management.

## Extends

- [`Initializable`](#).`Destroyable`

## Properties

### destroyed

> **destroyed**: `boolean`

#### Inherited from

`Destroyable.destroyed`

## Methods

### clear()

> **clear**(): `void`

Clears all entity stores.

#### Returns

`void`

***

### createStore()

> **createStore**(`entityName`): `void`

Creates a new store for the given entity name if it doesn't already exist.

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

#### Returns

`void`

#### Inherited from

`Destroyable.destroy`

***

### getStore()

> **getStore**\<`T`\>(`entityName`): `Map`\<`unknown`, `T`\>

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

Checks if a store for the given entity name exists.

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`boolean`

`true` if the store exists, `false` otherwise.

***

### init()

> **init**(...`args`): `void`

#### Parameters

##### args

...`unknown`[]

#### Returns

`void`

#### Inherited from

`Initializable.init`
