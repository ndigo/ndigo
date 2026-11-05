[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [jobs/redis-job-driver](../README.md) / RedisJobDriverOptions

# Interface: RedisJobDriverOptions

Options for [RedisJobDriver](../classes/RedisJobDriver.md).

## Properties

### connection

> **connection**: [`RedisConnection`](../../../connection/classes/RedisConnection.md)

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
