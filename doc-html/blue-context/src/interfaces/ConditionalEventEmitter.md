[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConditionalEventEmitter

# Interface: ConditionalEventEmitter

Defined in: [packages/blue-context/src/event-emitter.ts:115](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-115)

Event emitter with conditional and finite listeners.

## Extends

- [`EventEmitter`](EventEmitter.md)

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: [packages/blue-context/src/event-emitter.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-59)

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

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`emit`](EventEmitter.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: [packages/blue-context/src/event-emitter.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-65)

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

[`EventEmitter`](EventEmitter.md).[`eventTypes`](EventEmitter.md#eventtypes)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: [packages/blue-context/src/event-emitter.ts:72](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-72)

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

Defined in: [packages/blue-context/src/event-emitter.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-79)

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

### on()

> **on**(`type`, `listener?`): `this`

Defined in: [packages/blue-context/src/event-emitter.ts:87](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-87)

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

### off()

> **off**(`type`, `listener`): `this`

Defined in: [packages/blue-context/src/event-emitter.ts:95](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-95)

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

### many()

> **many**(`type`, `times`, `listener`): `this`

Defined in: [packages/blue-context/src/event-emitter.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-124)

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

### once()

> **once**(`type`, `listener`): `this`

Defined in: [packages/blue-context/src/event-emitter.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-132)

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

Defined in: [packages/blue-context/src/event-emitter.ts:140](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-140)

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
