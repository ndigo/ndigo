[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / DomainComponent

# Interface: DomainComponent

Defined in: [packages/blue-domain/src/component.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-37)

Represents a serializable, event-driven domain component with lifecycle hooks.

## Extends

- [`Initializable`](#).`EventEmitter`.`AsyncDestroyable`.`Serializable`

## Properties

### id

> **id**: `number`

Defined in: [packages/blue-domain/src/component.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-38)

***

### name

> **name**: `string`

Defined in: [packages/blue-domain/src/component.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-39)

***

### model

> **model**: `JSONObject`

Defined in: [packages/blue-domain/src/component.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-40)

***

### actions

> **actions**: [`DomainActions`](../type-aliases/DomainActions.md)

Defined in: [packages/blue-domain/src/component.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-41)

***

### data

> **data**: [`DomainData`](../type-aliases/DomainData.md)

Defined in: [packages/blue-domain/src/component.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-42)

***

### settings

> **settings**: [`DomainSettings`](../type-aliases/DomainSettings.md)

Defined in: [packages/blue-domain/src/component.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-43)

***

### states

> **states**: [`DomainStates`](../type-aliases/DomainStates.md)

Defined in: [packages/blue-domain/src/component.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-44)

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:3

#### Inherited from

`AsyncDestroyable.destroyed`

## Methods

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: packages/blue-context/lib/event-emitter.d.ts:40

Emits an event to the listeners registered for the given type.

#### Parameters

##### type

`EventType`

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`boolean`

`true` when at least one listener ran.

#### Inherited from

`EventEmitter.emit`

***

### eventTypes()

> **eventTypes**(): `EventType`[]

Defined in: packages/blue-context/lib/event-emitter.d.ts:46

Returns the event types with registered listeners.

#### Returns

`EventType`[]

The registered event types.

#### Inherited from

`EventEmitter.eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: packages/blue-context/lib/event-emitter.d.ts:53

Returns the number of listeners for a type.

#### Parameters

##### type

`EventType`

The event type.

#### Returns

`number`

The listener count.

#### Inherited from

`EventEmitter.listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: packages/blue-context/lib/event-emitter.d.ts:60

Returns a snapshot of listeners for a type.

#### Parameters

##### type

`EventType`

The event type.

#### Returns

`Function`[]

The registered listeners.

#### Inherited from

`EventEmitter.listeners`

***

### on()

> **on**(`type`, `listener?`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:68

Adds a listener for an event type.

#### Parameters

##### type

`EventType` \| `EventHandlers`

The event type.

##### listener?

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Inherited from

`EventEmitter.on`

***

### off()

> **off**(`type`, `listener`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:76

Removes a listener for an event type.

#### Parameters

##### type

`EventType`

The event type.

##### listener

`Function`

The listener to remove.

#### Returns

`this`

This emitter.

#### Inherited from

`EventEmitter.off`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`Serializable.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`Serializable.toJSON`

***

### validate()

> **validate**(`options?`): `ClassValidationResult`

Defined in: [packages/blue-domain/src/component.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/component.ts#lines-51)

Validates a component property before it is used or persisted.

#### Parameters

##### options?

`ClassValidationOptions`

Validation options.

#### Returns

`ClassValidationResult`

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: packages/blue-factory/lib/lifecycle.d.ts:7

#### Returns

`Promise`\<`void`\>

#### Inherited from

`AsyncDestroyable.destroy`

***

### init()

> **init**(...`args`): `void`

Defined in: packages/blue-factory/lib/lifecycle.d.ts:10

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Inherited from

`Initializable.init`
