[**@ndigo/locks v0.0.1**](../../README.md)

***

[@ndigo/locks](../../README.md) / [lock-driver](../README.md) / LockDriver

# Interface: LockDriver

The lock backend contract (AD-73 D-2): lease-based, fencing-enabled,
crash-self-healing. Acquisition is **non-blocking** — waiting policies
belong to the caller (`@scheduled({ lock, lockWait })`), never to the
driver.

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier (`'in-process'`, `'redis'`, …), for diagnostics.

## Methods

### acquire()

> **acquire**(`key`, `options`): `Promise`\<[`LockHandle`](LockHandle.md) \| `null`\>

Acquire `key` for `ttlMs`. Returns a fencing-token handle, or `null`
while another holder owns the lease. A lease that expired is simply
expired — the next acquirer wins, no sweeper involved.

#### Parameters

##### key

`string`

The lock key (namespaced by the driver).

##### options

[`LockAcquireOptions`](LockAcquireOptions.md)

Acquisition options.

#### Returns

`Promise`\<[`LockHandle`](LockHandle.md) \| `null`\>

The fencing handle, or `null` when the key is held.

***

### close()

> **close**(): `Promise`\<`void`\>

Releases every lease this driver's handles acquired and seals it.
Never affects leases acquired through other driver instances.

#### Returns

`Promise`\<`void`\>
