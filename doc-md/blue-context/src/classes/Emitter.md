[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / Emitter

# Class: Emitter

Defined in: packages/blue-context/src/event-emitter.ts:971

## Extends

- `EmitterBase`

## Constructors

### Constructor

> **new Emitter**(`mapping?`): `Emitter`

Defined in: packages/blue-context/src/event-emitter.ts:977

#### Parameters

##### mapping?

[`EventHandlers`](../type-aliases/EventHandlers.md)

#### Returns

`Emitter`

#### Overrides

`EmitterBase.constructor`

## Properties

### every

> `readonly` `static` **every**: `string` = `'*'`

Defined in: packages/blue-context/src/event-emitter.ts:972

***

### version

> `readonly` `static` **version**: `string` = `'3.0.0'`

Defined in: packages/blue-context/src/event-emitter.ts:973

***

### destroyed

> **destroyed**: `boolean` = `false`

Defined in: packages/blue-context/src/event-emitter.ts:975

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/src/event-emitter.ts:20

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### data

...`any`[]

#### Returns

`boolean`

#### Inherited from

`EmitterBase.emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

#### Inherited from

`EmitterBase.eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:22

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`number`

#### Inherited from

`EmitterBase.listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:23

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`Function`[]

#### Inherited from

`EmitterBase.listeners`

***

### on()

> **on**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:24

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

`EmitterBase.on`

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:25

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

`EmitterBase.off`

***

### clear()

> **clear**(`type?`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:987

#### Parameters

##### type?

[`EventType`](../type-aliases/EventType.md)

#### Returns

`this`

***

### toJSON()

> **toJSON**(): `any`

Defined in: packages/blue-context/src/event-emitter.ts:999

#### Returns

`any`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-context/src/event-emitter.ts:1012

Returns a string representation of an object.

#### Returns

`string`

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/event-emitter.ts:1016

#### Returns

`void`
