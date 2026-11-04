[**@ndigo/locks v0.0.1**](../README.md)

***

[@ndigo/locks](../README.md) / LockAcquireOptions

# Interface: LockAcquireOptions

Options for acquiring a lock.

## Properties

### ttlMs

> **ttlMs**: `number`

The lease duration in milliseconds. The holder must fit its work (or
heartbeat via [LockHandle.renew](LockHandle.md#renew)) inside this window; an expired
lease is simply expired — the next acquirer wins.
