[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / AbstractWebComponent

# Abstract Class: AbstractWebComponent

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-16)

Base class for BlueJS custom elements.

Provides a DOM-backed implementation of the EventEmitter interface,
batched rendering, and lifecycle hooks.

## Extends

- [`BlueElement`](../interfaces/BlueElement.md) & `HTMLElement`\<`this`\>

## Implements

- `EventEmitter`
- `ApplicationContextAware`

## Constructors

### Constructor

> **new AbstractWebComponent**(): `AbstractWebComponent`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-27)

#### Returns

`AbstractWebComponent`

#### Overrides

`AsBlueElement(HTMLElement).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `true` = `true`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-20)

#### Implementation of

`ApplicationContextAware.[$aware]`

***

### name

> **name**: `string`

Defined in: [packages/blue-view-webcomponent/src/blue-element.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/blue-element.ts#lines-8)

#### Inherited from

`AsBlueElement(HTMLElement).name`

## Accessors

### applicationContext

#### Get Signature

> **get** **applicationContext**(): `ApplicationContext`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-45)

Retrieves the ApplicationContext associated with this component.

##### Returns

`ApplicationContext`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-38)

Set the ApplicationContext that this object runs in.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`

***

### bindEvents()

> **bindEvents**(`mapping`): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-68)

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

### emit()

> **emit**(`type`, ...`data`): `boolean`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:105](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-105)

Emits an event to the listeners registered for the given type.

This implementation uses native DOM CustomEvents to ensure bubbling.

#### Parameters

##### type

`EventType`

The event type.

##### data

...`any`[]

Event payload values.

#### Returns

`boolean`

`true` when the event was dispatched.

#### Implementation of

`EventEmitter.emit`

***

### on()

> **on**(`type`, `listener?`): `this`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-124)

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

### off()

> **off**(`type`, `listener`): `this`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:191](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-191)

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

### eventTypes()

> **eventTypes**(): `EventType`[]

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:223](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-223)

Returns the event types with registered listeners.

#### Returns

`EventType`[]

#### Implementation of

`EventEmitter.eventTypes`

***

### listenerCount()

> **listenerCount**(`type`): `number`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:230](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-230)

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

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:238](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-238)

Returns a snapshot of listeners for a type.

#### Parameters

##### type

`EventType`

#### Returns

`Function`[]

#### Implementation of

`EventEmitter.listeners`

***

### select()

> **select**(`selector`): `Element` \| `null`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:249](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-249)

Shorthand for querySelector.

#### Parameters

##### selector

`string`

The CSS selector to search for.

#### Returns

`Element` \| `null`

The first matching element, or null if none found.

***

### create()

> **create**(`tag`, `props?`): `HTMLElement`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:260](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-260)

Creates a DOM element with the specified properties.

#### Parameters

##### tag

`string`

The HTML tag name.

##### props?

`Record`\<`string`, `any`\> = `{}`

A record of properties to apply to the element.

#### Returns

`HTMLElement`

The created HTMLElement.

***

### requestUpdate()

> **requestUpdate**(): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:281](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-281)

Schedules a render pass on the next animation frame.

#### Returns

`void`

***

### connectedCallback()

> **connectedCallback**(): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:292](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-292)

#### Returns

`void`

***

### disconnectedCallback()

> **disconnectedCallback**(): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:297](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-297)

#### Returns

`void`

***

### handleConnect()

> `protected` **handleConnect**(): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:306](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-306)

Lifecycle hook called when the component is added to the DOM.

#### Returns

`void`

***

### handleDisconnect()

> `protected` **handleDisconnect**(): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:313](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-313)

Lifecycle hook called when the component is removed from the DOM.

#### Returns

`void`

***

### render()

> `abstract` **render**(): `void`

Defined in: [packages/blue-view-webcomponent/src/abstract-web-component.ts:322](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/abstract-web-component.ts#lines-322)

Renders the component's UI.

This method must be implemented by subclasses to define the DOM structure.

#### Returns

`void`
