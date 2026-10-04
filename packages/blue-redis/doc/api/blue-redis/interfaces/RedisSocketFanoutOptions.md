[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-2.md) / RedisSocketFanoutOptions

# Interface: RedisSocketFanoutOptions

## Properties

### connection

> **connection**: [`RedisConnection`](../classes/RedisConnection.md)

Borrowed publisher; never subscribed or closed by this adapter.

***

### connectTimeout?

> `optional` **connectTimeout?**: `number`

***

### maxMessageBytes?

> `optional` **maxMessageBytes?**: `number`

***

### namespace

> **namespace**: `string`

Application/environment isolation boundary.

***

### subscriberUrl

> **subscriberUrl**: `string`

Dedicated owned subscriber URL (never reuse a command connection).
