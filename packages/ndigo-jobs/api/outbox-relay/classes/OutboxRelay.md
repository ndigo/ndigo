[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [outbox-relay](../README.md) / OutboxRelay

# Class: OutboxRelay

The relay half of the transactional outbox (AD-72 D-6): polls
[OutboxStore.claimPending](../../outbox/interfaces/OutboxStore.md#claimpending), publishes through an
[OutboxPublisher](../../outbox/interfaces/OutboxPublisher.md), then `markPublished`. A failed publish leaves the
entry claimed — the lease expiry re-surfaces it — so delivery is
at-least-once and consumers must be idempotent.

Lifecycle: `SmartLifecycle`, phase 10, auto-start when registered as a
bean; `close()` stops and awaits the pass in flight. Direct construction is
the standalone/test path.

## Implements

- `AsyncCloseable`

## Constructors

### Constructor

> **new OutboxRelay**(`options`): `OutboxRelay`

Creates a relay over the given store and publisher.

#### Parameters

##### options

[`OutboxRelayOptions`](../interfaces/OutboxRelayOptions.md)

Store, publisher, and relay tuning.

#### Returns

`OutboxRelay`

## Properties

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

Whether the relay auto-starts with the context.

***

### phase

> `readonly` **phase**: `10` = `10`

SmartLifecycle phase: after the store/queue wiring.

## Accessors

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

Whether the poll loop is running.

##### Returns

`boolean`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Container teardown: stops and awaits the pass in flight.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the relay is closed.

#### Implementation of

`AsyncCloseable.close`

***

### start()

> **start**(): `void`

SmartLifecycle start: arms the poll loop (idempotent).

#### Returns

`void`

***

### stop()

> **stop**(): `void`

SmartLifecycle stop: stops polling; the pass in flight completes.

#### Returns

`void`

***

### tick()

> **tick**(): `Promise`\<`number`\>

One relay pass: claims a batch, publishes each entry, marks published
entries, optionally prunes retained history. Single-flight.

#### Returns

`Promise`\<`number`\>

Number of entries published in this pass.
