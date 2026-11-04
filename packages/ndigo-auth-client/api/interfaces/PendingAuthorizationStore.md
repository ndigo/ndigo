[**@ndigo/auth-client v0.0.1**](../README.md)

***

[@ndigo/auth-client](../README.md) / PendingAuthorizationStore

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

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`state`): `Promise`\<[`PendingAuthorization`](PendingAuthorization.md) \| `null`\>

Returns the pending request for `state`, or `null` when unknown.

#### Parameters

##### state

`string`

#### Returns

`Promise`\<[`PendingAuthorization`](PendingAuthorization.md) \| `null`\>

***

### set()

> **set**(`state`, `pending`): `Promise`\<`void`\>

Stores `pending` under `state`, replacing any existing entry.

#### Parameters

##### state

`string`

##### pending

[`PendingAuthorization`](PendingAuthorization.md)

#### Returns

`Promise`\<`void`\>
