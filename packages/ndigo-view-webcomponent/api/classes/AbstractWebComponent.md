[**@ndigo/view-webcomponent v0.0.1**](../README.md)

***

[@ndigo/view-webcomponent](../README.md) / AbstractWebComponent

# Abstract Class: AbstractWebComponent

Base class for Ndigo custom elements.

Provides a DOM-backed implementation of the EventEmitter interface,
batched rendering, and lifecycle hooks.

## Extends

- [`NdigoElement`](../interfaces/NdigoElement.md) & `HTMLElement`\<`this`\>

## Implements

- `EventEmitter`
- `ApplicationContextAware`

## Constructors

### Constructor

> **new AbstractWebComponent**(): `AbstractWebComponent`

#### Returns

`AbstractWebComponent`

#### Overrides

`AsNdigoElement(HTMLElement).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `true` = `true`

#### Implementation of

`ApplicationContextAware.[$aware]`

***

### name

> **name**: `string`

#### Inherited from

`AsNdigoElement(HTMLElement).name`

## Accessors

### applicationContext

#### Get Signature

> **get** **applicationContext**(): `ApplicationContext`

Retrieves the ApplicationContext associated with this component.

##### Returns

`ApplicationContext`

## Methods

### bindEvents()

> **bindEvents**(`mapping`): `void`

Binds DOM events to class methods using event delegation.

This is a convenience wrapper around the `on` method.

#### Parameters

##### mapping

`Record`\<`string`, `string`\>

A mapping of selectors or 'event selector' to method names.
Example: { '.btn': 'handleBtn', 'change .input': 'handleInput' }

#### Returns

`void`

***

### connectedCallback()

> **connectedCallback**(): `void`

#### Returns

`void`

***

### create()

> **create**(`tag`, `props?`): `HTMLElement`

Creates a DOM element with the specified properties.

#### Parameters

##### tag

`string`

The HTML tag name.

##### props?

`Record`\<`string`, `unknown`\> = `{}`

A record of properties to apply to the element.

#### Returns

`HTMLElement`

The created HTMLElement.

***

### disconnectedCallback()

> **disconnectedCallback**(): `void`

#### Returns

`void`

***

### emit()

> **emit**(`type`, ...`data`): `boolean`

Emits an event to the listeners registered for the given type.

This implementation uses native DOM CustomEvents to ensure bubbling.

#### Parameters

##### type

`EventType`

The event type.

##### data

...`unknown`[]

Event payload values.

#### Returns

`boolean`

`true` when the event was dispatched.

#### Implementation of

`EventEmitter.emit`

***

### eventTypes()

> **eventTypes**(): `EventType`[]

Returns the event types with registered listeners.

#### Returns

`EventType`[]

#### Implementation of

`EventEmitter.eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Returns the number of listeners for a type.

#### Parameters

##### type

`EventType`

#### Returns

`number`

#### Implementation of

`EventEmitter.listenerCount`

***

### listeners()

> **listeners**(`type`): `Function`[]

Returns a snapshot of listeners for a type.

#### Parameters

##### type

`EventType`

#### Returns

`Function`[]

#### Implementation of

`EventEmitter.listeners`

***

### off()

> **off**(`type`, `listener`): `this`

Removes a listener for an event type.

#### Parameters

##### type

`EventType`

The event type.

##### listener

`string` \| `Function`

The listener to remove.

#### Returns

`this`

This component.

#### Implementation of

`EventEmitter.off`

***

### on()

> **on**(`type`, `listener?`): `this`

Adds a listener for an event type.

Supports both standard event types and delegated selectors.
If the type contains a space (e.g., 'click .btn'), it is treated as a delegated event.

#### Parameters

##### type

`EventType` \| `EventHandlers`

The event type or a mapping of event types to handlers.

##### listener?

`string` \| `Function`

The listener to register.

#### Returns

`this`

This component.

#### Implementation of

`EventEmitter.on`

***

### render()

> `abstract` **render**(): `void`

Renders the component's UI.

This method must be implemented by subclasses to define the DOM structure.

#### Returns

`void`

***

### requestUpdate()

> **requestUpdate**(): `void`

Schedules a render pass on the next animation frame.

#### Returns

`void`

***

### select()

> **select**(`selector`): `Element` \| `null`

Shorthand for querySelector.

#### Parameters

##### selector

`string`

The CSS selector to search for.

#### Returns

`Element` \| `null`

The first matching element, or null if none found.

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`
