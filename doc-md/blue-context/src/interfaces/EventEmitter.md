[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / EventEmitter

# Interface: EventEmitter

Defined in: packages/blue-context/src/event-emitter.ts:60

Emits and manages event listeners.

## Extended by

- [`ApplicationContext`](ApplicationContext.md)
- [`AsyncEventEmitter`](AsyncEventEmitter.md)
- [`ConditionalEventEmitter`](ConditionalEventEmitter.md)
- [`PositionalEventEmitter`](PositionalEventEmitter.md)

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/src/event-emitter.ts:68

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:74

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:81

Returns the number of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`number`

The listener count.

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:88

Returns a snapshot of listeners for a type.

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

The event type.

#### Returns

`Function`[]

The registered listeners.

***

### on()

> **on**(`type`, `listener?`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:96

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

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:104

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
