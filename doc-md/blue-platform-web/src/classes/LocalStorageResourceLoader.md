[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / LocalStorageResourceLoader

# Class: LocalStorageResourceLoader

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:19

Resource loader that persists data to `localStorage`.

Provides a simple key-value storage adapter backed by the browser's
`localStorage` API. Useful for caching user preferences, theme selections,
or small amounts of data that should survive page reloads.

## Example

```ts
const storage = new LocalStorageResourceLoader('my-app');
storage.setItem('theme', 'dark');
const theme = storage.getItem('theme'); // 'dark'
```

## Constructors

### Constructor

> **new LocalStorageResourceLoader**(`prefix?`): `LocalStorageResourceLoader`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:28

Creates a `localStorage`-backed resource loader.

#### Parameters

##### prefix?

`string` = `'blue'`

Optional namespace prefix to avoid key collisions.
  Defaults to `'blue'`.

#### Returns

`LocalStorageResourceLoader`

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:117

Returns the number of stored items with the configured prefix.

##### Returns

`number`

## Methods

### setItem()

> **setItem**(`key`, `value`): `void`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:45

Stores a value in `localStorage`.

#### Parameters

##### key

`string`

The storage key.

##### value

`unknown`

The value to store. Objects are serialized as JSON.

#### Returns

`void`

***

### getItem()

> **getItem**(`key`): `string` \| `null`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:60

Retrieves a value from `localStorage`.

#### Parameters

##### key

`string`

The storage key.

#### Returns

`string` \| `null`

The stored value, or `null` when not found.

***

### getJSON()

> **getJSON**\<`T`\>(`key`): `T` \| `null`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:74

Retrieves a parsed JSON value from `localStorage`.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The storage key.

#### Returns

`T` \| `null`

The parsed value, or `null` when not found or invalid JSON.

***

### removeItem()

> **removeItem**(`key`): `void`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:88

Removes a value from `localStorage`.

#### Parameters

##### key

`string`

The storage key to remove.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-platform-web/src/local-storage-resource-loader.ts:99

Removes all items with the configured prefix.

#### Returns

`void`
