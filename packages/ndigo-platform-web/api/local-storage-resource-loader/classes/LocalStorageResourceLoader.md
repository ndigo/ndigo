[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [local-storage-resource-loader](../README.md) / LocalStorageResourceLoader

# Class: LocalStorageResourceLoader

Resource loader that persists data to `localStorage`.

## Since

1.0.0

## Author

Jeff Rose

## Constructors

### Constructor

> **new LocalStorageResourceLoader**(`prefix?`): `LocalStorageResourceLoader`

Creates a `localStorage`-backed resource loader.

#### Parameters

##### prefix?

`string` = `'ndigo'`

Optional namespace prefix to avoid key collisions.
  Defaults to `'ndigo'`.

#### Returns

`LocalStorageResourceLoader`

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Returns the number of stored items with the configured prefix.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Removes all items with the configured prefix.

#### Returns

`void`

***

### getItem()

> **getItem**(`key`): `string` \| `null`

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

Removes a value from `localStorage`.

#### Parameters

##### key

`string`

The storage key to remove.

#### Returns

`void`

***

### setItem()

> **setItem**(`key`, `value`): `void`

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
