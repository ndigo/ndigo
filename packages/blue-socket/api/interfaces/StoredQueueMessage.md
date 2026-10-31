[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / StoredQueueMessage

# Interface: StoredQueueMessage

A stored `/queue` message — the durable unit behind the backlog.

## Properties

### body

> `readonly` **body**: [`StompBody`](../type-aliases/StompBody.md)

The message body — text or byte-exact binary (D8).

***

### destination

> `readonly` **destination**: `string`

The `/queue/<name>` destination the message belongs to.

***

### headers

> `readonly` **headers**: `Readonly`\<`Record`\<`string`, `string`\>\>

Extra headers (e.g. `content-type`), copied at append time.

***

### messageId

> `readonly` **messageId**: `string`

Broker-issued id; the dedupe key on replay (at-least-once).

***

### seq

> `readonly` **seq**: `number`

Monotonic sequence — the ordering and gap-detection key, issued by
the store. Per-destination and 1-based on the memory backend,
globally monotonic on libsql; gaps are expected (see the module
docblock), so only monotonicity within a replay window is portable.

***

### storedAt

> `readonly` **storedAt**: `number`

Append timestamp (epoch ms) — the retention (TTL) criterion.
