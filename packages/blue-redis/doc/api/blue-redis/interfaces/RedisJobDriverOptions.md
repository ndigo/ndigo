[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-3.md) / RedisJobDriverOptions

# Interface: RedisJobDriverOptions

Options for [RedisJobDriver](../classes/RedisJobDriver.md).

## Properties

### connection

> **connection**: [`RedisConnection`](../classes/RedisConnection.md)

Borrowed connection (already connected or connected by the application).

***

### idFactory?

> `optional` **idFactory?**: () => `string`

Id factory override; defaults to `crypto.randomUUID`.

#### Returns

`string`

***

### namespace

> **namespace**: `string`

Application/environment namespace; isolates queues sharing one Redis.
