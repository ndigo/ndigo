[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / DomainComponent

# Interface: DomainComponent

Defined in: packages/blue-domain/src/component.ts:22

## Extends

- [`Initializable`](../../../blue-factory/src/interfaces/Initializable.md).[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`AsyncDestroyable`](../../../blue-factory/src/interfaces/AsyncDestroyable.md).[`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Properties

### id

> **id**: `number`

Defined in: packages/blue-domain/src/component.ts:23

***

### name

> **name**: `string`

Defined in: packages/blue-domain/src/component.ts:24

***

### model

> **model**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-domain/src/component.ts:25

***

### actions

> **actions**: [`DomainActions`](../type-aliases/DomainActions.md)

Defined in: packages/blue-domain/src/component.ts:26

***

### data

> **data**: [`DomainData`](../type-aliases/DomainData.md)

Defined in: packages/blue-domain/src/component.ts:27

***

### settings

> **settings**: [`DomainSettings`](../type-aliases/DomainSettings.md)

Defined in: packages/blue-domain/src/component.ts:28

***

### states

> **states**: [`DomainStates`](../type-aliases/DomainStates.md)

Defined in: packages/blue-domain/src/component.ts:29

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-factory/src/lifecycle.ts:7

#### Inherited from

[`AsyncDestroyable`](../../../blue-factory/src/interfaces/AsyncDestroyable.md).[`destroyed`](../../../blue-factory/src/interfaces/AsyncDestroyable.md#destroyed)

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/src/event-emitter.ts:20

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

##### data

...`any`[]

#### Returns

`boolean`

#### Inherited from

[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`emit`](../../../blue-context/src/interfaces/EventEmitter.md#emit)

***

### eventTypes()

> **eventTypes**(): [`EventType`](../../../blue-context/src/type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)[]

#### Inherited from

[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`eventTypes`](../../../blue-context/src/interfaces/EventEmitter.md#eventtypes)

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:22

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

#### Returns

`number`

#### Inherited from

[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`listenerCount`](../../../blue-context/src/interfaces/EventEmitter.md#listenercount)

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:23

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

#### Returns

`Function`[]

#### Inherited from

[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`listeners`](../../../blue-context/src/interfaces/EventEmitter.md#listeners)

***

### on()

> **on**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:24

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`on`](../../../blue-context/src/interfaces/EventEmitter.md#on)

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/src/event-emitter.ts:25

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

##### listener

`Function`

#### Returns

`this`

#### Inherited from

[`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md).[`off`](../../../blue-context/src/interfaces/EventEmitter.md#off)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/serializable.ts:29

#### Returns

`string`

#### Inherited from

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/serializable.ts:30

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### validate()

> **validate**(`property`): `void`

Defined in: packages/blue-domain/src/component.ts:30

#### Parameters

##### property

`string`

#### Returns

`void`

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: packages/blue-factory/src/lifecycle.ts:12

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AsyncDestroyable`](../../../blue-factory/src/interfaces/AsyncDestroyable.md).[`destroy`](../../../blue-factory/src/interfaces/AsyncDestroyable.md#destroy)

***

### init()

> **init**(...`args`): `void`

Defined in: packages/blue-factory/src/lifecycle.ts:16

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Inherited from

[`Initializable`](../../../blue-factory/src/interfaces/Initializable.md).[`init`](../../../blue-factory/src/interfaces/Initializable.md#init)
