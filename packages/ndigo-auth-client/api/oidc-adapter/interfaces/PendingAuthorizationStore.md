[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [oidc-adapter](../README.md) / PendingAuthorizationStore

# Interface: PendingAuthorizationStore

Persistence seam for pending authorization requests.

The adapter defaults to [InMemoryPendingAuthorizationStore](../classes/InMemoryPendingAuthorizationStore.md), an
in-memory map **scoped to one adapter instance**. That default cannot
survive the provider redirect when the callback is handled elsewhere — a
fresh page load, a process restart, or another server instance — so those
deployments MUST inject a store backed by shared storage (for example
`sessionStorage` in a browser or Redis server-side). With the default
store, only the instance that created the request can complete it.

Redemption is single-use: the adapter deletes the entry after a successful
or expired lookup. Expiry is enforced by the adapter on every exchange;
implementations MAY additionally purge expired entries.

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'session-storage'`, `'redis'`).

## Methods

### delete()

> **delete**(`state`): `Promise`\<`void`\>

Removes the entry for `state`; unknown keys are a no-op.

#### Parameters

##### state

`string`

The authorization-state value.

#### Returns

`Promise`\<`void`\>

A promise that resolves once removed.

***

### get()

> **get**(`state`): `Promise`\<[`PendingAuthorization`](PendingAuthorization.md) \| `null`\>

Returns the pending request for `state`, or `null` when unknown.

#### Parameters

##### state

`string`

The authorization-state value.

#### Returns

`Promise`\<[`PendingAuthorization`](PendingAuthorization.md) \| `null`\>

The pending authorization request, or `null`.

***

### set()

> **set**(`state`, `pending`): `Promise`\<`void`\>

Stores `pending` under `state`, replacing any existing entry.

#### Parameters

##### state

`string`

The authorization-state value.

##### pending

[`PendingAuthorization`](PendingAuthorization.md)

The pending request to store.

#### Returns

`Promise`\<`void`\>

A promise that resolves once stored.
