[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / EventEmitter

# Interface: EventEmitter

Defined in: packages/blue-context/src/event-emitter.ts:19

## Extended by

- [`ApplicationContext`](ApplicationContext.md)
- [`AsyncEventEmitter`](AsyncEventEmitter.md)
- [`ConditionalEventEmitter`](ConditionalEventEmitter.md)
- [`DomainComponent`](../../../blue-domain/src/interfaces/DomainComponent.md)

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

***

### eventTypes()

> **eventTypes**(): [`EventType`](../type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../type-aliases/EventType.md)[]

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:22

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`number`

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:23

#### Parameters

##### type

[`EventType`](../type-aliases/EventType.md)

#### Returns

`Function`[]

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
