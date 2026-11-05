[**@ndigo/locks v0.0.1**](../../README.md)

***

[@ndigo/locks](../../README.md) / [lock-driver](../README.md) / LockHandle

# Interface: LockHandle

A held (or previously held) lease. The token is checked by the backend on
every mutation, so a handle whose token lost the lease fails loudly rather
than corrupting the successor's lease.

## Properties

### expiresAt

> `readonly` **expiresAt**: `number`

The lease expiry (epoch milliseconds), captured at acquire/renew.

***

### token

> `readonly` **token**: `number`

Monotonic fence token for this acquisition (per lock key), starting
at `1`. `renew`/`release`/`isHeld` succeed only while this handle's
token is the current one.

## Methods

### isHeld()

> **isHeld**(): `Promise`\<`boolean`\>

Whether this handle still holds the lease. `false` once the lease
expired or another acquisition took the key.

#### Returns

`Promise`\<`boolean`\>

***

### release()

> **release**(): `Promise`\<`boolean`\>

Atomically releases the lease if — and only if — this handle's token
is still the current one. Returns `false` when another holder took
over after our expiry (fencing guard), in which case nothing is
released.

#### Returns

`Promise`\<`boolean`\>

***

### renew()

> **renew**(`ttlMs`): `Promise`\<`boolean`\>

Extends the lease from now by `ttlMs`. Returns `false` when the token
is no longer the current one (lease expired and was re-acquired).

#### Parameters

##### ttlMs

`number`

The new lease duration in milliseconds.

#### Returns

`Promise`\<`boolean`\>
