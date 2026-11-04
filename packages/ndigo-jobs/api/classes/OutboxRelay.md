[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / OutboxRelay

# Class: OutboxRelay

The relay half of the transactional outbox (AD-72 D-6): polls
[OutboxStore.claimPending](../interfaces/OutboxStore.md#claimpending), publishes through an
[OutboxPublisher](../interfaces/OutboxPublisher.md), then `markPublished`. A failed publish leaves the
entry claimed — the lease expiry re-surfaces it — so delivery is
at-least-once and consumers must be idempotent.

Lifecycle: `SmartLifecycle`, phase 10, auto-start when registered as a
bean; `close()` stops and awaits the pass in flight. Direct construction is
the standalone/test path.

## Since

1.0.0

## Constructors

### Constructor

> **new OutboxRelay**(`options`): `OutboxRelay`

#### Parameters

##### options

[`OutboxRelayOptions`](../interfaces/OutboxRelayOptions.md)

Store, publisher, and relay tuning.

#### Returns

`OutboxRelay`

## Properties

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

***

### phase

> `readonly` **phase**: `10` = `10`

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
