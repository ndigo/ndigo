[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / Emitter

# Class: Emitter

Defined in: packages/blue-context/src/event-emitter.ts:484

Standalone event emitter with destroy and serialization support.

## Extends

- [`EventEmitter`](../interfaces/EventEmitter.md)\<`this`\> & `Null`\<`this`\>

## Implements

- `Destroyable`
- `Serializable`

## Constructors

### Constructor

> **new Emitter**(`mapping?`): `Emitter`

Defined in: packages/blue-context/src/event-emitter.ts:495

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

### every

> `readonly` `static` **every**: `string` = `$every`

Defined in: packages/blue-context/src/event-emitter.ts:485

***

### version

> `readonly` `static` **version**: `string` = `'3.0.0'`

Defined in: packages/blue-context/src/event-emitter.ts:486

***

### destroyed

> **destroyed**: `boolean` = `false`

Defined in: packages/blue-context/src/event-emitter.ts:488

#### Implementation of

`Destroyable.destroyed`

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

#### Inherited from

`AsEventEmitter(Null).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:74

Returns the event types with registered listeners.

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

The registered event types.

#### Inherited from

`AsEventEmitter(Null).eventTypes`

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

#### Inherited from

`AsEventEmitter(Null).listenerCount`

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

#### Inherited from

`AsEventEmitter(Null).listeners`

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

#### Inherited from

`AsEventEmitter(Null).on`

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

#### Inherited from

`AsEventEmitter(Null).off`

***

### clear()

> **clear**(`type?`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:514

Removes listeners for one type or for all types.

#### Parameters

##### type?

[`EventType`](../type-aliases/EventType.md)

Optional event type to clear.

#### Returns

`this`

This emitter.

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-context/src/event-emitter.ts:524

Serializes the listener counts to JSON.

#### Returns

`JSONValue`

A JSON representation of the emitter state.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-context/src/event-emitter.ts:543

Returns a compact textual summary of the emitter.

#### Returns

`string`

A string representation.

#### Implementation of

`Serializable.toString`

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/event-emitter.ts:550

Destroys the emitter and clears its listeners.

#### Returns

`void`

#### Implementation of

`Destroyable.destroy`
