[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [locks/redis-lock-driver](../README.md) / RedisLockDriverOptions

# Interface: RedisLockDriverOptions

Options for [RedisLockDriver](../classes/RedisLockDriver.md).

## Properties

### connection

> **connection**: [`RedisConnection`](../../../connection/classes/RedisConnection.md)

Borrowed connection (already connected or connected by the application).

***

### namespace

> **namespace**: `string`

Application/environment namespace; isolates lock spaces sharing one Redis.
