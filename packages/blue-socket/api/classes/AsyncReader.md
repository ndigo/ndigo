[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / AsyncReader

# Class: AsyncReader\<T\>

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

***

### push()

> **push**(`value`): `void`

Queue a value for the consumer. Drops the incoming value when a
bound is exceeded; `onOverflow` fires once per overflow episode.

#### Parameters

##### value

`T`

#### Returns

`void`
