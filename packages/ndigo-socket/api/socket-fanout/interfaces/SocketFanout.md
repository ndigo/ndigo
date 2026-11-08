[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [socket-fanout](../README.md) / SocketFanout

# Interface: SocketFanout

Optional application-owned transport. Subscription completion is readiness.
publish resolves after backend acceptance, not client delivery. It excludes
the publishing transport's subscriptions: consumers deliver locally once.
Consumers must unsubscribe before the application closes the transport.

## Methods

### publish()

> **publish**(`scope`, `message`): `Promise`\<`void`\>

Publishes one message after backend acceptance.

#### Parameters

##### scope

[`SocketFanoutScope`](../type-aliases/SocketFanoutScope.md)

The fan-out scope to publish to.

##### message

[`SocketFanoutMessage`](SocketFanoutMessage.md)

The message to publish.

#### Returns

`Promise`\<`void`\>

A promise that resolves after backend acceptance.

***

### subscribe()

> **subscribe**(`scope`, `receive`): `Promise`\<() => `Promise`\<`void`\>\>

Subscribes to a scope's messages; completion signals readiness.

#### Parameters

##### scope

[`SocketFanoutScope`](../type-aliases/SocketFanoutScope.md)

The fan-out scope to subscribe to.

##### receive

(`message`) => `void`

Invoked for each published message.

#### Returns

`Promise`\<() => `Promise`\<`void`\>\>

An unsubscribe function.
