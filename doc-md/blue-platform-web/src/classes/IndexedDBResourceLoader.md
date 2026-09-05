[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / IndexedDBResourceLoader

# Class: IndexedDBResourceLoader

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:30](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-30)

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

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-36)

#### Parameters

##### config?

[`IndexedDBConfig`](../interfaces/IndexedDBConfig.md) = `{}`

#### Returns

`IndexedDBResourceLoader`

## Methods

### setItem()

> **setItem**(`key`, `value`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-74)

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

***

### getItem()

> **getItem**\<`T`\>(`key`): `Promise`\<`T` \| `null`\>

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-91)

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

### removeItem()

> **removeItem**(`key`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:111](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-111)

Removes a value from IndexedDB.

#### Parameters

##### key

`string`

The storage key to remove.

#### Returns

`Promise`\<`void`\>

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:125](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-125)

Clears all values from the store.

#### Returns

`Promise`\<`void`\>

***

### keys()

> **keys**(): `Promise`\<`string`[]\>

Defined in: [packages/blue-platform-web/src/indexeddb-resource-loader.ts:139](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/indexeddb-resource-loader.ts#lines-139)

Returns all keys in the store.

#### Returns

`Promise`\<`string`[]\>
