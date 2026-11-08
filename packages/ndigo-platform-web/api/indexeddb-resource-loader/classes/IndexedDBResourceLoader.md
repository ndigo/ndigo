[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [indexeddb-resource-loader](../README.md) / IndexedDBResourceLoader

# Class: IndexedDBResourceLoader

Resource loader that persists data to IndexedDB.

Provides async key-value storage backed by the browser's IndexedDB API.
Suitable for larger datasets than `localStorage` can handle.

## Example

```ts
const db = new IndexedDBResourceLoader({ dbName: 'my-app' });
await db.setItem('settings', { theme: 'dark' });
const settings = await db.getItem('settings');
```

## Constructors

### Constructor

> **new IndexedDBResourceLoader**(`config?`): `IndexedDBResourceLoader`

#### Parameters

##### config?

[`IndexedDBConfig`](../interfaces/IndexedDBConfig.md) = `{}`

#### Returns

`IndexedDBResourceLoader`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Clears all values from the store.

#### Returns

`Promise`\<`void`\>

A promise that resolves once cleared.

***

### close()

> **close**(): `void`

Closes the open connection and clears the memoized open promise.
Idempotent — a subsequent operation reopens the database.

#### Returns

`void`

***

### getItem()

> **getItem**\<`T`\>(`key`): `Promise`\<`T` \| `null`\>

Retrieves a value from IndexedDB.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The storage key.

#### Returns

`Promise`\<`T` \| `null`\>

The stored value, or `null` when not found.

***

### keys()

> **keys**(): `Promise`\<`string`[]\>

Returns all keys in the store.

#### Returns

`Promise`\<`string`[]\>

The stored keys.

***

### removeItem()

> **removeItem**(`key`): `Promise`\<`void`\>

Removes a value from IndexedDB.

#### Parameters

##### key

`string`

The storage key to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves once removed.

***

### setItem()

> **setItem**(`key`, `value`): `Promise`\<`void`\>

Stores a value in IndexedDB.

#### Parameters

##### key

`string`

The storage key.

##### value

`unknown`

The value to store.

#### Returns

`Promise`\<`void`\>

A promise that resolves once written.
