[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / InMemoryRefreshTokenStore

# Class: InMemoryRefreshTokenStore

Default [RefreshTokenStore](../interfaces/RefreshTokenStore.md): a bounded in-memory map scoped to a
single adapter instance.

At the cap (100 entries) `set` evicts the oldest binding, so a refresh
flood cannot grow the map without limit.

## Implements

- [`RefreshTokenStore`](../interfaces/RefreshTokenStore.md)

## Constructors

### Constructor

> **new InMemoryRefreshTokenStore**(): `InMemoryRefreshTokenStore`

#### Returns

`InMemoryRefreshTokenStore`

## Properties

### kind

> `readonly` **kind**: `"in-memory"` = `'in-memory'`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'redis'`).

#### Implementation of

[`RefreshTokenStore`](../interfaces/RefreshTokenStore.md).[`kind`](../interfaces/RefreshTokenStore.md#kind)

## Methods

### delete()

> **delete**(`token`): `Promise`\<`void`\>

Removes the binding for `token` (rotation consumes the presented token).

#### Parameters

##### token

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RefreshTokenStore`](../interfaces/RefreshTokenStore.md).[`delete`](../interfaces/RefreshTokenStore.md#delete)

***

### get()

> **get**(`token`): `Promise`\<[`RefreshTokenBinding`](../interfaces/RefreshTokenBinding.md) \| `null`\>

Returns the binding for `token`, or `null` when unknown or consumed.

#### Parameters

##### token

`string`

#### Returns

`Promise`\<[`RefreshTokenBinding`](../interfaces/RefreshTokenBinding.md) \| `null`\>

#### Implementation of

[`RefreshTokenStore`](../interfaces/RefreshTokenStore.md).[`get`](../interfaces/RefreshTokenStore.md#get)

***

### set()

> **set**(`token`, `binding`): `Promise`\<`void`\>

Stores the binding for `token`, replacing any existing entry.

#### Parameters

##### token

`string`

##### binding

[`RefreshTokenBinding`](../interfaces/RefreshTokenBinding.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RefreshTokenStore`](../interfaces/RefreshTokenStore.md).[`set`](../interfaces/RefreshTokenStore.md#set)
