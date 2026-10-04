[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / StompBroker

# Class: StompBroker

STOMP 1.2 broker — transport-agnostic, one instance per destination
namespace (app-scoped bean, AD-23 D1).

## Example

```ts
const broker = new StompBroker();
@requestMapping('/stomp')
class ChatController {
    @stompMapping('/chat')
    @parameters({ session: socketSessionValue('session') })
    async chat(session: SocketSession) {
        await broker.handleSocket(session);
    }
    @scheduled('0/3 * * * * *')
    tick() { broker.publish('/topic/chat', JSON.stringify({ at: Date.now() })); }
}
```

## Constructors

### Constructor

> **new StompBroker**(`options?`): `StompBroker`

#### Parameters

##### options?

[`StompBrokerOptions`](../interfaces/StompBrokerOptions.md) = `{}`

Routing seam and test hooks.

#### Returns

`StompBroker`

## Accessors

### queueStore

#### Get Signature

> **get** **queueStore**(): [`QueueMessageStore`](../interfaces/QueueMessageStore.md) \| `null`

The `/queue` persistence layer — the durable-queue seam (a libsql or
Redis implementation can be swapped in place of the default memory
store). The store is the single source of truth for `/queue`
retention and replay. `null` when storage is disabled
(`queueBacklog: 0` or an explicit `queueStore: null`) — then
`/queue` is live fan-out with no replay.

##### Returns

[`QueueMessageStore`](../interfaces/QueueMessageStore.md) \| `null`

***

### subscriptions

#### Get Signature

> **get** **subscriptions**(): `number`

Total subscription count across all sessions (observability).

##### Returns

`number`

***

### unackedMessages

#### Get Signature

> **get** **unackedMessages**(): `number`

Total delivered-but-unacked messages across all subscriptions (D9
observability, ack ≠ auto) — the broker-side outstanding-delivery
gauge.

##### Returns

`number`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Close sessions and unsubscribe; the application owns transport shutdown.

#### Returns

`Promise`\<`void`\>

***

### closeAll()

> **closeAll**(`code?`, `reason?`): `void`

Close every connected session tracked by the broker (graceful
shutdown integration; the transport's `closeAll` path remains the
AD-21 registry's job — this closes the STOMP side).

#### Parameters

##### code?

`number` = `1001`

Close status code (default `1001` going away).

##### reason?

`string` = `'broker shutdown'`

Human-readable close reason.

#### Returns

`void`

***

### connect()

> **connect**(): `Promise`\<`void`\>

Await live topic subscription readiness before accepting traffic.

#### Returns

`Promise`\<`void`\>

***

### handleSocket()

> **handleSocket**(`session`): `Promise`\<`void`\>

Run the STOMP endpoint protocol for one connection.

Consumes `session.messages` until the connection closes: parses each
frame, answers CONNECT with CONNECTED, maintains the session's
subscriptions, fans out SEND frames, validates ACK/NACK, emits
receipts, and fails closed on protocol violations. Session
subscriptions are dropped when the stream ends.

#### Parameters

##### session

[`SocketSession`](../interfaces/SocketSession.md)

The socket session (any transport).

#### Returns

`Promise`\<`void`\>

***

### history()

> **history**(`destination`, `options?`): `Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)[]\>

Read the retained history of a `/queue` destination — the same seam
subscribe replay reads from. `limit` is the newest-window (default
`queueBacklog`), `afterSeq` resumes past a gap; messages expired by
the retention TTL are pruned first. Returns `[]` when storage is
disabled or the store is unavailable (the read fails open — a
history query must never break an app).

#### Parameters

##### destination

`string`

The `/queue/<name>` destination.

##### options?

The history window.

###### afterSeq?

`number`

###### limit?

`number`

#### Returns

`Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md)[]\>

The stored messages, append-ordered.

***

### publish()

> **publish**(`destination`, `body`, `headers?`): `Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md) \| `undefined`\>

Server-initiated fan-out: send a `MESSAGE` frame to every
subscription of `destination`, each carrying the subscriber's own
`subscription` id and the same fresh `message-id` per receiving broker
(acks and redelivery remain local to that broker). `/queue` destinations persist
through the store (the durable-queue seam) before fan-out; the
returned value is the stored message — `undefined` for non-`/queue`
destinations, disabled storage, or a store failure (the caller
decides the failure signal; live fan-out happens either way).
Configured `/topic/*` fan-out awaits transport acceptance before local
delivery and rejects backend failures; it has no replay or peer acknowledgement.

#### Parameters

##### destination

`string`

The destination (e.g. `/topic/chat`).

##### body

[`StompBody`](../type-aliases/StompBody.md)

The message body (text or bytes — D8).

##### headers?

`Record`\<`string`, `string`\> = `{}`

Extra headers on the MESSAGE frames (e.g. `content-type`).

#### Returns

`Promise`\<[`StoredQueueMessage`](../interfaces/StoredQueueMessage.md) \| `undefined`\>

The stored message for a persisted `/queue` append, else `undefined`.

***

### sendToUser()

> **sendToUser**(`user`, `destination`, `body`, `headers?`): `void`

Principal-scoped fan-out (D10): deliver to the `resolveUser`-scoped
subscriptions of `user` — those bound to `/user/<destination>`
(Spring convention: subscribe `/user/queue/errors`, then
`sendToUser(user, '/queue/errors', …)`). MESSAGE frames carry the
`/user/...` destination the client subscribed with.

#### Parameters

##### user

`string`

The target principal.

##### destination

`string`

The destination suffix (e.g. `/queue/errors`).

##### body

[`StompBody`](../type-aliases/StompBody.md)

The message body (text or bytes — D8).

##### headers?

`Record`\<`string`, `string`\> = `{}`

Extra headers on the MESSAGE frames.

#### Returns

`void`
