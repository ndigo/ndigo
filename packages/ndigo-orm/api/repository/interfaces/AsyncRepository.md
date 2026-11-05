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

#### Returns

`Promise`\<`number`\>

***

### deleteById()

> **deleteById**(`id`): `Promise`\<`boolean`\>

#### Parameters

##### id

`ID`

#### Returns

`Promise`\<`boolean`\>

***

### existsById()

> **existsById**(`id`): `Promise`\<`boolean`\>

#### Parameters

##### id

`ID`

#### Returns

`Promise`\<`boolean`\>

***

### findAll()

> **findAll**(`options?`): `Promise`\<`T`[]\>

#### Parameters

##### options?

[`RelationFetchOptions`](RelationFetchOptions.md)

#### Returns

`Promise`\<`T`[]\>

***

### findById()

> **findById**(`id`, `options?`): `Promise`\<`T` \| `undefined`\>

#### Parameters

##### id

`ID`

##### options?

[`RelationFetchOptions`](RelationFetchOptions.md)

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### findPage()

> **findPage**(`request`): `Promise`\<[`Page`](../../page/interfaces/Page.md)\<`T`\>\>

#### Parameters

##### request

[`PageRequest`](../../page/interfaces/PageRequest.md)

#### Returns

`Promise`\<[`Page`](../../page/interfaces/Page.md)\<`T`\>\>

***

### loadRelation()

> **loadRelation**(`entity`, `relationName`): `Promise`\<`unknown`\>

#### Parameters

##### entity

`T`

##### relationName

`string`

#### Returns

`Promise`\<`unknown`\>

***

### save()

> **save**(`entity`): `Promise`\<`T`\>

#### Parameters

##### entity

`T`

#### Returns

`Promise`\<`T`\>
