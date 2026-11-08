[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [async-reader](../README.md) / AsyncReader

# Class: AsyncReader\<T\>

Push-to-pull adapter: producers `push()` inbound values, consumers iterate or
`read()` them. Pending values sit in a ring buffer bounded by count and
(optionally) bytes; over a bound the newest values are dropped and
`onOverflow` fires once per episode, so one slow reader cannot grow the queue
without limit.

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new AsyncReader**\<`T`\>(`maxQueue?`, `onOverflow?`, `options?`): `AsyncReader`\<`T`\>

#### Parameters

##### maxQueue?

`number` = `Number.POSITIVE_INFINITY`

Maximum queued values before overflow handling.

##### onOverflow?

() => `void`

Invoked once when a push hits a full queue.

##### options?

Optional byte budget: with `sizeOf` and `maxBytes`
  set, pushes are also dropped past `maxBytes` cumulative bytes.

###### maxBytes?

`number` \| `null`

###### sizeOf?

(`value`) => `number`

#### Returns

`AsyncReader`\<`T`\>

## Methods

### complete()

> **complete**(): `void`

End the stream after the remaining queue drains. Idempotent.

#### Returns

`void`

***

### iterable()

> **iterable**(): `AsyncGenerator`\<`T`\>

Consume the stream: FIFO values, then completion. Draining below the
bound clears any overflow episode, letting pushes resume.

#### Returns

`AsyncGenerator`\<`T`\>

An async generator over the queued values.

***

### push()

> **push**(`value`): `void`

Queue a value for the consumer. Drops the incoming value when a
bound is exceeded; `onOverflow` fires once per overflow episode.

#### Parameters

##### value

`T`

The value to enqueue.

#### Returns

`void`
