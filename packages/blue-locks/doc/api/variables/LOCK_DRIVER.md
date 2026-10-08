[**@blue/locks v0.0.1**](../README.md)

***

[@blue/locks](../README.md) / LOCK\_DRIVER

# Variable: LOCK\_DRIVER

> `const` **LOCK\_DRIVER**: [`ContextToken`](#)\<[`LockDriver`](../interfaces/LockDriver.md)\>

Token for the application context's shared [LockDriver](../interfaces/LockDriver.md) bean —
the `@scheduled({ lock })` runner resolves the driver through it when no
driver was passed to the constructor (the `NodeAutoConfiguration`
single-bean wiring).
