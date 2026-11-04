[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / ConditionalEventEmitter

# Interface: ConditionalEventEmitter

Event emitter with conditional and finite listeners.

## Extends

- [`EventEmitter`](EventEmitter.md)

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`emit`](EventEmitter.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`eventTypes`](EventEmitter.md#eventtypes)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`number`

The listener count.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`listenerCount`](EventEmitter.md#listenercount)

***

### listeners()

> **listeners**(`type`): `Function`[]

Returns a snapshot of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`listeners`](EventEmitter.md#listeners)

***

### many()

> **many**(`type`, `times`, `listener`): `this`

Registers a listener that fires a fixed number of times.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### times

`number`

The number of invocations to allow.

##### listener

`Function`

The listener to register.

#### Returns

`this`

This emitter.

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`off`](EventEmitter.md#off)

***

### on()

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md) \| [`EventHandlers`](../type-aliases/EventHandlers.md)

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`on`](EventEmitter.md#on)

***

### once()

> **once**(`type`, `listener`): `this`

Registers a listener that fires once.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to register.

#### Returns

`this`

This emitter.

***

### until()

> **until**(`type`, `listener`): `this`

Registers a listener that removes itself when it returns `true`.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### listener

`Function`

The listener to register.

#### Returns

`this`

This emitter.
