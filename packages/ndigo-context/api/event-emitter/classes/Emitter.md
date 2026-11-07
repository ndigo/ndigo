[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [event-emitter](../README.md) / Emitter

# Class: Emitter

Standalone event emitter with destroy and serialization support.

## Extends

- [`EventEmitter`](../interfaces/EventEmitter.md)\<`this`\> & `Null`\<`this`\>

## Implements

- `Destroyable`
- `Serializable`

## Constructors

### Constructor

> **new Emitter**(`mapping?`): `Emitter`

Creates an emitter and optionally seeds it with listeners.

#### Parameters

##### mapping?

[`EventHandlers`](../type-aliases/EventHandlers.md)

Optional initial event mappings.

#### Returns

`Emitter`

#### Overrides

`AsEventEmitter(Null).constructor`

## Properties

### destroyed

> **destroyed**: `boolean` = `false`

Whether the emitter has been destroyed.

#### Implementation of

`Destroyable.destroyed`

***

### every

> `readonly` `static` **every**: `string` = `$every`

Sentinel type matching every event.

***

### version

> `readonly` `static` **version**: `string` = `'3.0.0'`

Emitter implementation version.

## Methods

### clear()

> **clear**(`type?`): `this`

Removes listeners for one type or for all types.

#### Parameters

##### type?

[`EventType`](../type-aliases/EventType.md)

Optional event type to clear.

#### Returns

`this`

This emitter.

***

### destroy()

> **destroy**(): `void`

Destroys the emitter and clears its listeners.

#### Returns

`void`

#### Implementation of

`Destroyable.destroy`

***

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

`AsEventEmitter(Null).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

`AsEventEmitter(Null).eventTypes`

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

`AsEventEmitter(Null).listenerCount`

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

`AsEventEmitter(Null).listeners`

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

`AsEventEmitter(Null).off`

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

`AsEventEmitter(Null).on`

***

### toJSON()

> **toJSON**(): `JSONValue`

Serializes the listener counts to JSON.

#### Returns

`JSONValue`

A JSON representation of the emitter state.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Returns a compact textual summary of the emitter.

#### Returns

`string`

A string representation.

#### Implementation of

`Serializable.toString`
