[**@ndigo/locks v0.0.1**](../../README.md)

***

[@ndigo/locks](../../README.md) / [in-process-lock-driver](../README.md) / InProcessLockDriverOptions

# Interface: InProcessLockDriverOptions

Options for constructing [InProcessLockDriver](../classes/InProcessLockDriver.md).

## Properties

### clock?

> `optional` **clock?**: () => `number`

Injectable epoch-millisecond clock (defaults to `Date.now`). Tests
advance it to prove expiry and fencing without sleeping.

#### Returns

`number`

***

### prefix?

> `optional` **prefix?**: `string`

Key prefix separating independent lock namespaces sharing one process
(default `'ndigo'`).
