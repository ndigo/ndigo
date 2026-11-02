[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / RefreshTokenStore

# Interface: RefreshTokenStore

Persistence seam for refresh-token bindings.

The adapter defaults to [InMemoryRefreshTokenStore](../classes/InMemoryRefreshTokenStore.md), an in-memory
map **scoped to one adapter instance** — both the binding and the
single-use rotation bookkeeping live there. Deployments where a refresh
may arrive on another instance (a second tab, a restart, or another
server) MUST inject a store backed by shared storage; with the default,
a refresh token captured elsewhere is rejected (`invalid_token`).

Only tokens this adapter captured from its own exchanges (or rotations)
are redeemable — an access or ID token is never a refresh credential
(the SE-7 mirror: as refresh tokens never authenticate, access tokens
never refresh).

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier for observability/diagnostics
(e.g. `'in-memory'`, `'redis'`).

## Methods

### delete()

> **delete**(`token`): `Promise`\<`void`\>

Removes the binding for `token` (rotation consumes the presented token).

#### Parameters

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`token`): `Promise`\<[`RefreshTokenBinding`](RefreshTokenBinding.md) \| `null`\>

Returns the binding for `token`, or `null` when unknown or consumed.

#### Parameters

##### token

`string`

#### Returns

`Promise`\<[`RefreshTokenBinding`](RefreshTokenBinding.md) \| `null`\>

***

### set()

> **set**(`token`, `binding`): `Promise`\<`void`\>

Stores the binding for `token`, replacing any existing entry.

#### Parameters

##### token

`string`

##### binding

[`RefreshTokenBinding`](RefreshTokenBinding.md)

#### Returns

`Promise`\<`void`\>
