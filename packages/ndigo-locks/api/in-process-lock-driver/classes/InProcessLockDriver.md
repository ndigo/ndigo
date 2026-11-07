[**@ndigo/locks v0.0.1**](../../README.md)

***

[@ndigo/locks](../../README.md) / [in-process-lock-driver](../README.md) / InProcessLockDriver

# Class: InProcessLockDriver

The in-process [LockDriver](../../lock-driver/interfaces/LockDriver.md). See the module doc for the shared-table
semantics; [InProcessLockDriver.close](#close) releases only the leases this
instance acquired.

## Implements

- [`LockDriver`](../../lock-driver/interfaces/LockDriver.md)

## Constructors

### Constructor

> **new InProcessLockDriver**(`options?`): `InProcessLockDriver`

#### Parameters

##### options?

[`InProcessLockDriverOptions`](../interfaces/InProcessLockDriverOptions.md) = `{}`

Clock override and key prefix (see the interface).

#### Returns

`InProcessLockDriver`

## Properties

### kind

> `readonly` **kind**: `"in-process"` = `'in-process'`

Backend identifier for diagnostics.

#### Implementation of

[`LockDriver`](../../lock-driver/interfaces/LockDriver.md).[`kind`](../../lock-driver/interfaces/LockDriver.md#kind)

## Methods

### acquire()

> **acquire**(`key`, `options`): `Promise`\<[`LockHandle`](../../lock-driver/interfaces/LockHandle.md) \| `null`\>

Acquires a lock lease for `key`, or returns `null` when it is already held.

#### Parameters

##### key

`string`

The lock key.

##### options

Lease options; `ttlMs` bounds how long the lease is held.

###### ttlMs

`number`

#### Returns

`Promise`\<[`LockHandle`](../../lock-driver/interfaces/LockHandle.md) \| `null`\>

The lock handle, or `null` when the key is already locked.

#### Implementation of

[`LockDriver`](../../lock-driver/interfaces/LockDriver.md).[`acquire`](../../lock-driver/interfaces/LockDriver.md#acquire)

***

### close()

> **close**(): `Promise`\<`void`\>

Releases every lease this driver still holds and marks it closed.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the leases are released.

#### Implementation of

[`LockDriver`](../../lock-driver/interfaces/LockDriver.md).[`close`](../../lock-driver/interfaces/LockDriver.md#close)
