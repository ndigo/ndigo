[**@blue/locks v0.0.1**](../README.md)

***

[@blue/locks](../README.md) / InProcessLockDriver

# Class: InProcessLockDriver

The in-process [LockDriver](../interfaces/LockDriver.md). See the module doc for the shared-table
semantics; [InProcessLockDriver.close](#close) releases only the leases this
instance acquired.

## Implements

- [`LockDriver`](../interfaces/LockDriver.md)

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

[`LockDriver`](../interfaces/LockDriver.md).[`kind`](../interfaces/LockDriver.md#kind)

## Methods

### acquire()

> **acquire**(`key`, `options`): `Promise`\<[`LockHandle`](../interfaces/LockHandle.md) \| `null`\>

Acquire `key` for `ttlMs`. Returns a fencing-token handle, or `null`
while another holder owns the lease. A lease that expired is simply
expired — the next acquirer wins, no sweeper involved.

#### Parameters

##### key

`string`

The lock key (namespaced by the driver).

##### options

Acquisition options.

###### ttlMs

`number`

#### Returns

`Promise`\<[`LockHandle`](../interfaces/LockHandle.md) \| `null`\>

The fencing handle, or `null` when the key is held.

#### Implementation of

[`LockDriver`](../interfaces/LockDriver.md).[`acquire`](../interfaces/LockDriver.md#acquire)

***

### close()

> **close**(): `Promise`\<`void`\>

Releases every lease this driver's handles acquired and seals it.
Never affects leases acquired through other driver instances.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`LockDriver`](../interfaces/LockDriver.md).[`close`](../interfaces/LockDriver.md#close)
