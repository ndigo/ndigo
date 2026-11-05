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

#### Parameters

##### scope

[`SocketFanoutScope`](../type-aliases/SocketFanoutScope.md)

##### message

[`SocketFanoutMessage`](SocketFanoutMessage.md)

#### Returns

`Promise`\<`void`\>

***

### subscribe()

> **subscribe**(`scope`, `receive`): `Promise`\<() => `Promise`\<`void`\>\>

#### Parameters

##### scope

[`SocketFanoutScope`](../type-aliases/SocketFanoutScope.md)

##### receive

(`message`) => `void`

#### Returns

`Promise`\<() => `Promise`\<`void`\>\>
