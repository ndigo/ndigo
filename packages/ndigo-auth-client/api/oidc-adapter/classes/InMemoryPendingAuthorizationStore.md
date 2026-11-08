[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / InMemoryPendingAuthorizationStore

# Class: InMemoryPendingAuthorizationStore

Default [PendingAuthorizationStore](../interfaces/PendingAuthorizationStore.md): a bounded in-memory map scoped
to a single adapter instance.

At the cap (20 entries) `set` evicts the oldest entry — the same memory
bound the adapter previously applied inline — so a creation flood cannot
grow the map without limit. Entries persist until redeemed or evicted.

## Implements

- [`PendingAuthorizationStore`](../interfaces/PendingAuthorizationStore.md)

## Constructors

### Constructor

> **new InMemoryPendingAuthorizationStore**(): `InMemoryPendingAuthorizationStore`

#### Returns

`InMemoryPendingAuthorizationStore`

## Properties

### kind

> `readonly` **kind**: `"in-memory"` = `'in-memory'`

Store identifier (`'in-memory'`).

#### Implementation of

[`PendingAuthorizationStore`](../interfaces/PendingAuthorizationStore.md).[`kind`](../interfaces/PendingAuthorizationStore.md#kind)

## Methods

### delete()

> **delete**(`state`): `Promise`\<`void`\>

Removes the entry for `state`.

#### Parameters

##### state

`string`

The authorization-state value.

#### Returns

`Promise`\<`void`\>

A promise that resolves once removed.

#### Implementation of

[`PendingAuthorizationStore`](../interfaces/PendingAuthorizationStore.md).[`delete`](../interfaces/PendingAuthorizationStore.md#delete)

***

### get()

> **get**(`state`): `Promise`\<[`PendingAuthorization`](../interfaces/PendingAuthorization.md) \| `null`\>

Returns the pending request for `state`, or `null` when unknown.

#### Parameters

##### state

`string`

The authorization-state value.

#### Returns

`Promise`\<[`PendingAuthorization`](../interfaces/PendingAuthorization.md) \| `null`\>

The pending request, or `null`.

#### Implementation of

[`PendingAuthorizationStore`](../interfaces/PendingAuthorizationStore.md).[`get`](../interfaces/PendingAuthorizationStore.md#get)

***

### set()

> **set**(`state`, `pending`): `Promise`\<`void`\>

Stores `pending` under `state`, evicting the oldest entry at the cap.

#### Parameters

##### state

`string`

The authorization-state value.

##### pending

[`PendingAuthorization`](../interfaces/PendingAuthorization.md)

The pending request to store.

#### Returns

`Promise`\<`void`\>

A promise that resolves once stored.

#### Implementation of

[`PendingAuthorizationStore`](../interfaces/PendingAuthorizationStore.md).[`set`](../interfaces/PendingAuthorizationStore.md#set)
