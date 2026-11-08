[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [repository](../README.md) / AsyncRepository

# Interface: AsyncRepository\<T, ID\>

Promise-based counterpart to [Repository](Repository.md) for backend-neutral async consumers.
Missing entities resolve to `undefined`; operation failures reject the promise.

## Type Parameters

### T

`T` *extends* `object`

### ID

`ID`

## Methods

### count()

> **count**(): `Promise`\<`number`\>

Counts all entities.

#### Returns

`Promise`\<`number`\>

The entity count.

***

### deleteById()

> **deleteById**(`id`): `Promise`\<`boolean`\>

Deletes an entity by id.

#### Parameters

##### id

`ID`

The entity id.

#### Returns

`Promise`\<`boolean`\>

***

### existsById()

> **existsById**(`id`): `Promise`\<`boolean`\>

Whether an entity exists.

#### Parameters

##### id

`ID`

The entity id.

#### Returns

`Promise`\<`boolean`\>

***

### findAll()

> **findAll**(`options?`): `Promise`\<`T`[]\>

Returns all entities.

#### Parameters

##### options?

[`RelationFetchOptions`](RelationFetchOptions.md)

Optional relation loading.

#### Returns

`Promise`\<`T`[]\>

***

### findById()

> **findById**(`id`, `options?`): `Promise`\<`T` \| `undefined`\>

Finds an entity by id.

#### Parameters

##### id

`ID`

The entity id.

##### options?

[`RelationFetchOptions`](RelationFetchOptions.md)

Optional relation loading.

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### findPage()

> **findPage**(`request`): `Promise`\<[`Page`](../../page/interfaces/Page.md)\<`T`\>\>

Returns one page of results.

#### Parameters

##### request

[`PageRequest`](../../page/interfaces/PageRequest.md)

The page request.

#### Returns

`Promise`\<[`Page`](../../page/interfaces/Page.md)\<`T`\>\>

***

### loadRelation()

> **loadRelation**(`entity`, `relationName`): `Promise`\<`unknown`\>

Loads one relation onto an entity.

#### Parameters

##### entity

`T`

The entity.

##### relationName

`string`

The relation field.

#### Returns

`Promise`\<`unknown`\>

***

### save()

> **save**(`entity`): `Promise`\<`T`\>

Persists an entity.

#### Parameters

##### entity

`T`

The entity to save.

#### Returns

`Promise`\<`T`\>
