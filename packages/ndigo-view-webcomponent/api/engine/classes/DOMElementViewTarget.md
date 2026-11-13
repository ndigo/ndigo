[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [engine](../README.md) / DOMElementViewTarget

# Class: DOMElementViewTarget

View target implementation that renders into a host DOM node.

## Implements

- [`DOMViewTarget`](../interfaces/DOMViewTarget.md)
- `Destroyable`

## Constructors

### Constructor

> **new DOMElementViewTarget**(`host`, `options?`): `DOMElementViewTarget`

Creates a DOM-backed view target for the provided host node.

#### Parameters

##### host

[`RenderHost`](../type-aliases/RenderHost.md) \| `null`

The host node that will contain rendered content.

##### options?

Event mapping used to bridge DOM events to the application context.

###### eventMap?

`Record`\<`string`, `string`\>

#### Returns

`DOMElementViewTarget`

#### Throws

When `host` is null or undefined.

## Properties

### destroyed

> **destroyed**: `boolean`

Whether the target has been destroyed.

#### Implementation of

`Destroyable.destroyed`

## Accessors

### container

#### Get Signature

> **get** **container**(): [`RenderHost`](../type-aliases/RenderHost.md)

The host node that receives rendered content.

##### Returns

[`RenderHost`](../type-aliases/RenderHost.md)

The host node that receives rendered output.

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`container`](../interfaces/DOMViewTarget.md#container)

## Methods

### clear()

> **clear**(): `void`

Clears rendered content without permanently destroying the target.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`clear`](../interfaces/DOMViewTarget.md#clear)

***

### commit()

> **commit**(`output`, `model`, `route`): `void`

Commits rendered output to the host node and re-enables event bridging.

A string is parsed as HTML and appended as a fragment (views that render
template strings, such as `StringTemplateView`, produce fragment markup).
A single existing child whose tag name matches the output is reused by
updating its model instead of being replaced, so web component model
updates drive re-rendering in place.

#### Parameters

##### output

`unknown`

The rendered DOM subtree or HTML string to attach.

##### model

`unknown`

The model passed through from the view engine.

##### route

[`Route`](#)

The active route associated with the render pass.

#### Returns

`void`

#### Throws

When the target has already been destroyed.

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`commit`](../interfaces/DOMViewTarget.md#commit)

***

### destroy()

> **destroy**(): `void`

Permanently disables the target and releases its event listeners.

#### Returns

`void`

#### Implementation of

`Destroyable.destroy`

***

### listen()

> **listen**(): `void`

Installs DOM event listeners for the current event map.

Existing listeners are removed first so repeated calls stay idempotent.

#### Returns

`void`

***

### prepare()

> **prepare**(`route`): `void`

Prepares the target for a new render pass by clearing existing content.

#### Parameters

##### route

[`Route`](#)

The active route associated with the render pass.

#### Returns

`void`

#### Throws

When the target has already been destroyed.

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`prepare`](../interfaces/DOMViewTarget.md#prepare)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Connects the target to the application event emitter so DOM events can be forwarded.

#### Parameters

##### applicationContext

`EventEmitter`

The application event emitter used for event bridging.

#### Returns

`void`

***

### setEventMap()

> **setEventMap**(`eventMap`): `void`

Replaces the DOM-to-application event map and refreshes listeners.

#### Parameters

##### eventMap

`Record`\<`string`, `string`\>

Mapping from DOM event names to application event names.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`setEventMap`](../interfaces/DOMViewTarget.md#seteventmap)

***

### unlisten()

> **unlisten**(): `void`

Removes all installed DOM event listeners from the host node.

#### Returns

`void`
