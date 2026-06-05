[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / GenericDomainComponent

# Class: GenericDomainComponent

Defined in: packages/blue-domain/src/component.ts:69

Represents a serializable, event-driven domain component with lifecycle hooks.

## Extends

- `Emitter`

## Implements

- [`DomainComponent`](../interfaces/DomainComponent.md)

## Constructors

### Constructor

> **new GenericDomainComponent**(): `GenericDomainComponent`

Defined in: packages/blue-domain/src/component.ts:96

Creates a new component instance with a unique identifier.

#### Returns

`GenericDomainComponent`

#### Overrides

`Emitter.constructor`

## Properties

### every

> `readonly` `static` **every**: `string`

Defined in: packages/blue-context/lib/event-emitter.d.ts:183

#### Inherited from

`Emitter.every`

***

### version

> `readonly` `static` **version**: `string`

Defined in: packages/blue-context/lib/event-emitter.d.ts:184

#### Inherited from

`Emitter.version`

***

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-context/lib/event-emitter.d.ts:185

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`destroyed`](../interfaces/DomainComponent.md#destroyed)

#### Inherited from

`Emitter.destroyed`

***

### id

> **id**: `number`

Defined in: packages/blue-domain/src/component.ts:70

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`id`](../interfaces/DomainComponent.md#id)

***

### name

> **name**: `string`

Defined in: packages/blue-domain/src/component.ts:71

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`name`](../interfaces/DomainComponent.md#name)

***

### model

> **model**: `JSONObject`

Defined in: packages/blue-domain/src/component.ts:72

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`model`](../interfaces/DomainComponent.md#model)

***

### actions

> **actions**: [`DomainActions`](../type-aliases/DomainActions.md)

Defined in: packages/blue-domain/src/component.ts:73

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`actions`](../interfaces/DomainComponent.md#actions)

***

### settings

> **settings**: [`DomainSettings`](../type-aliases/DomainSettings.md)

Defined in: packages/blue-domain/src/component.ts:74

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`settings`](../interfaces/DomainComponent.md#settings)

***

### states

> **states**: [`DomainStates`](../type-aliases/DomainStates.md)

Defined in: packages/blue-domain/src/component.ts:75

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`states`](../interfaces/DomainComponent.md#states)

***

### validate

> **validate**: (`options?`) => `ClassValidationResult`

Defined in: packages/blue-domain/src/component.ts:76

Validates a component property before it is used or persisted.

#### Parameters

##### options?

`ClassValidationOptions`

Validation options.

#### Returns

`ClassValidationResult`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`validate`](../interfaces/DomainComponent.md#validate)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-domain/src/component.ts:78

##### Returns

`string`

***

### data

#### Set Signature

> **set** **data**(`newData`): `void`

Defined in: packages/blue-domain/src/component.ts:87

Assigns initial data by mirroring model values onto the component instance.

##### Parameters

###### newData

[`DomainData`](../type-aliases/DomainData.md)

Initial domain data to attach.

##### Returns

`void`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`data`](../interfaces/DomainComponent.md#data)

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`emit`](../interfaces/DomainComponent.md#emit)

#### Inherited from

`Emitter.emit`

***

### eventTypes()

> **eventTypes**(): `EventType`[]

Defined in: packages/blue-context/lib/event-emitter.d.ts:46

Returns the event types with registered listeners.

#### Returns

`EventType`[]

The registered event types.

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`eventTypes`](../interfaces/DomainComponent.md#eventtypes)

#### Inherited from

`Emitter.eventTypes`

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`listenerCount`](../interfaces/DomainComponent.md#listenercount)

#### Inherited from

`Emitter.listenerCount`

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`listeners`](../interfaces/DomainComponent.md#listeners)

#### Inherited from

`Emitter.listeners`

***

### on()

> **on**(`type`, `listener`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:68

Adds a listener for an event type.

#### Parameters

##### type

`EventType`

The event type.

##### listener

`Function`

The listener to register.

#### Returns

`this`

This emitter.

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`on`](../interfaces/DomainComponent.md#on)

#### Inherited from

`Emitter.on`

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

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`off`](../interfaces/DomainComponent.md#off)

#### Inherited from

`Emitter.off`

***

### clear()

> **clear**(`type?`): `this`

Defined in: packages/blue-context/lib/event-emitter.d.ts:198

Removes listeners for one type or for all types.

#### Parameters

##### type?

`EventType`

Optional event type to clear.

#### Returns

`this`

This emitter.

#### Inherited from

`Emitter.clear`

***

### init()

> **init**(`name`): `void`

Defined in: packages/blue-domain/src/component.ts:111

Sets the component name after construction.

#### Parameters

##### name

`string`

Human-readable component name.

#### Returns

`void`

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`init`](../interfaces/DomainComponent.md#init)

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: packages/blue-domain/src/component.ts:124

Destroys the component and releases any associated resources.

#### Returns

`Promise`\<`void`\>

A promise that resolves when destruction is complete.

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`destroy`](../interfaces/DomainComponent.md#destroy)

#### Overrides

`Emitter.destroy`

***

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: packages/blue-domain/src/component.ts:136

Serializes the component to a JSON-compatible object.

#### Returns

`JSONObject`

A JSON object containing the component identity.

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`toJSON`](../interfaces/DomainComponent.md#tojson)

#### Overrides

`Emitter.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-domain/src/component.ts:150

Returns the component name for string coercion.

#### Returns

`string`

The component name.

#### Implementation of

[`DomainComponent`](../interfaces/DomainComponent.md).[`toString`](../interfaces/DomainComponent.md#tostring)

#### Overrides

`Emitter.toString`
