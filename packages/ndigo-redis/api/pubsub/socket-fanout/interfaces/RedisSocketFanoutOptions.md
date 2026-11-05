[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [pubsub/socket-fanout](../README.md) / RedisSocketFanoutOptions

# Interface: RedisSocketFanoutOptions

Options for the Redis socket fan-out: the borrowed command `connection`, a
dedicated `subscriberUrl` for the fan-out's own subscription, the
`namespace` isolating applications, and size/timeout bounds for message
payloads and connect attempts.

## Properties

### connection

> **connection**: [`RedisConnection`](../../../connection/classes/RedisConnection.md)

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
