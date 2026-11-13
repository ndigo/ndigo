[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [shadow-root-view-target](../README.md) / ShadowRootViewTarget

# Class: ShadowRootViewTarget

A view target that renders into a shadow root.

If constructed with a host element, an open shadow root is attached on demand
(reusing an existing open shadow root when present). Closed shadow roots
cannot be rendered into and throw.

## Implements

- [`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md)
- `Destroyable`

## Constructors

### Constructor

> **new ShadowRootViewTarget**(`host`, `options?`): `ShadowRootViewTarget`

Creates a shadow-root-backed view target.

#### Parameters

##### host

`Element` \| `ShadowRoot` \| `null`

The host element (an open shadow root is attached if missing)
  or an existing `ShadowRoot`.

##### options?

Event mapping used to bridge DOM events to the application context.

###### eventMap?

`Record`\<`string`, `string`\>

#### Returns

`ShadowRootViewTarget`

#### Throws

When `host` is null/undefined or lacks `attachShadow`.

#### Throws

When the host already has a closed shadow root.

## Accessors

### container

#### Get Signature

> **get** **container**(): [`RenderHost`](../../engine/type-aliases/RenderHost.md)

The host node that receives rendered content.

##### Returns

[`RenderHost`](../../engine/type-aliases/RenderHost.md)

The host node that receives rendered output.

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`container`](../../engine/interfaces/DOMViewTarget.md#container)

***

### destroyed

#### Get Signature

> **get** **destroyed**(): `boolean`

Whether the target has been destroyed.

##### Returns

`boolean`

#### Implementation of

`Destroyable.destroyed`

## Methods

### clear()

> **clear**(): `void`

Clears the shadow root without destroying the target.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`clear`](../../engine/interfaces/DOMViewTarget.md#clear)

***

### commit()

> **commit**(`output`, `model`, `route`): `void`

Commits rendered output to the shadow root.

#### Parameters

##### output

`unknown`

The rendered output (DOM subtree or markup string).

##### model

`unknown`

The model passed through from the view engine.

##### route

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route being rendered.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`commit`](../../engine/interfaces/DOMViewTarget.md#commit)

***

### destroy()

> **destroy**(): `void`

Destroys the target and releases the shadow root's listeners.

#### Returns

`void`

#### Implementation of

`Destroyable.destroy`

***

### listen()

> **listen**(): `void`

Re-installs the inner target's DOM event listeners.

#### Returns

`void`

***

### prepare()

> **prepare**(`route`): `void`

Prepares the shadow root for a new render pass.

#### Parameters

##### route

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route being rendered.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`prepare`](../../engine/interfaces/DOMViewTarget.md#prepare)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Forwards the application context to the inner element target.

#### Parameters

##### applicationContext

`EventEmitter`

The application event emitter.

#### Returns

`void`

***

### setEventMap()

> **setEventMap**(`eventMap`): `void`

Forwards the DOM event map to the inner element target.

#### Parameters

##### eventMap

`Record`\<`string`, `string`\>

DOM event name → application event name mapping.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`setEventMap`](../../engine/interfaces/DOMViewTarget.md#seteventmap)

***

### unlisten()

> **unlisten**(): `void`

Removes the inner target's DOM event listeners.

#### Returns

`void`
