[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / GenericDomainComponent

# Class: GenericDomainComponent

Defined in: packages/blue-domain/src/component.ts:49

## Extends

- [`EventEmitter`](../../../blue-context/src/interfaces/EventEmitter.md)\<`this`\> & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Implements

- [`DomainComponent`](../interfaces/DomainComponent.md)

## Constructors

### Constructor

> **new GenericDomainComponent**(): `GenericDomainComponent`

Defined in: packages/blue-domain/src/component.ts:68

#### Returns

`GenericDomainComponent`

#### Overrides

`AsEventEmitter(Null).constructor`

## Properties

### id

> **id**: `number`

Defined in: packages/blue-domain/src/component.ts:50

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`id`](../interfaces/DomainComponent.md#id)

***

### name

> **name**: `string`

Defined in: packages/blue-domain/src/component.ts:51

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`name`](../interfaces/DomainComponent.md#name)

***

### model

> **model**: [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-domain/src/component.ts:52

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`model`](../interfaces/DomainComponent.md#model)

***

### actions

> **actions**: [`DomainActions`](../type-aliases/DomainActions.md)

Defined in: packages/blue-domain/src/component.ts:53

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`actions`](../interfaces/DomainComponent.md#actions)

***

### settings

> **settings**: [`DomainSettings`](../type-aliases/DomainSettings.md)

Defined in: packages/blue-domain/src/component.ts:54

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`settings`](../interfaces/DomainComponent.md#settings)

***

### states

> **states**: [`DomainStates`](../type-aliases/DomainStates.md)

Defined in: packages/blue-domain/src/component.ts:55

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`states`](../interfaces/DomainComponent.md#states)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-domain/src/component.ts:56

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`destroyed`](../interfaces/DomainComponent.md#destroyed)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-domain/src/component.ts:58

##### Returns

`string`

***

### data

#### Set Signature

> **set** **data**(`newData`): `void`

Defined in: packages/blue-domain/src/component.ts:62

##### Parameters

###### newData

[`DomainData`](../type-aliases/DomainData.md)

##### Returns

`void`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`data`](../interfaces/DomainComponent.md#data)

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`emit`](../interfaces/DomainComponent.md#emit)

#### Inherited from

`AsEventEmitter(Null).emit`

***

### eventTypes()

> **eventTypes**(): [`EventType`](../../../blue-context/src/type-aliases/EventType.md)[]

Defined in: packages/blue-context/src/event-emitter.ts:21

#### Returns

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)[]

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`eventTypes`](../interfaces/DomainComponent.md#eventtypes)

#### Inherited from

`AsEventEmitter(Null).eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/src/event-emitter.ts:22

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

#### Returns

`number`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`listenerCount`](../interfaces/DomainComponent.md#listenercount)

#### Inherited from

`AsEventEmitter(Null).listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/src/event-emitter.ts:23

#### Parameters

##### type

[`EventType`](../../../blue-context/src/type-aliases/EventType.md)

#### Returns

`Function`[]

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`listeners`](../interfaces/DomainComponent.md#listeners)

#### Inherited from

`AsEventEmitter(Null).listeners`

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`on`](../interfaces/DomainComponent.md#on)

#### Inherited from

`AsEventEmitter(Null).on`

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`off`](../interfaces/DomainComponent.md#off)

#### Inherited from

`AsEventEmitter(Null).off`

***

### init()

> **init**(`name`): `void`

Defined in: packages/blue-domain/src/component.ts:78

#### Parameters

##### name

`string`

#### Returns

`void`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`init`](../interfaces/DomainComponent.md#init)

***

### validate()

> **validate**(`property`): `void`

Defined in: packages/blue-domain/src/component.ts:86

#### Parameters

##### property

`string`

#### Returns

`void`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`validate`](../interfaces/DomainComponent.md#validate)

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: packages/blue-domain/src/component.ts:90

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`destroy`](../interfaces/DomainComponent.md#destroy)

***

### toJSON()

> **toJSON**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

Defined in: packages/blue-domain/src/component.ts:94

#### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`toJSON`](../interfaces/DomainComponent.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-domain/src/component.ts:103

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`toString`](../interfaces/DomainComponent.md#tostring)
