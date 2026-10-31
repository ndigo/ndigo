[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-4.md) / RedisLockDriverOptions

# Interface: RedisLockDriverOptions

Options for [RedisLockDriver](../classes/RedisLockDriver.md).

## Properties

### connection

> **connection**: [`RedisConnection`](../classes/RedisConnection.md)

Borrowed connection (already connected or connected by the application).

***

### namespace

> **namespace**: `string`

Application/environment namespace; isolates lock spaces sharing one Redis.
