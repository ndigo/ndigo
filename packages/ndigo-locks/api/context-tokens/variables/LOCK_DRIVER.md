[**@ndigo/locks v0.0.1**](../../README.md)

***

[@ndigo/locks](../../README.md) / [context-tokens](../README.md) / LOCK\_DRIVER

# Variable: LOCK\_DRIVER

> `const` **LOCK\_DRIVER**: [`ContextToken`](#)\<[`LockDriver`](../../lock-driver/interfaces/LockDriver.md)\>

Token for the application context's shared [LockDriver](../../lock-driver/interfaces/LockDriver.md) entry —
the `@scheduled({ lock })` runner resolves the driver through it when no
driver was passed to the constructor (the `NodeAutoConfiguration`
single-entry wiring).
