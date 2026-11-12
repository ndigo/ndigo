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

Cleans up the ViewTarget.

#### Returns

`void`

A promise that resolves when cleanup completes.

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`clear`](../../engine/interfaces/DOMViewTarget.md#clear)

***

### commit()

> **commit**(`output`, `model`, `route`): `void`

Commits the rendered output to the target.
The type of `output` depends on the View engine (e.g., HTMLElement, string).

#### Parameters

##### output

`unknown`

The rendered output.

##### model

`unknown`

The model used to produce the output.

##### route

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route being rendered.

#### Returns

`void`

A promise that resolves when the output has been committed.

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`commit`](../../engine/interfaces/DOMViewTarget.md#commit)

***

### destroy()

> **destroy**(): `void`

Releases the value's resources.

#### Returns

`void`

#### Implementation of

`Destroyable.destroy`

***

### listen()

> **listen**(): `void`

#### Returns

`void`

***

### prepare()

> **prepare**(`route`): `void`

Prepares the target for rendering (e.g., clearing previous content).

#### Parameters

##### route

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route being rendered.

#### Returns

`void`

A promise that resolves when preparation completes.

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`prepare`](../../engine/interfaces/DOMViewTarget.md#prepare)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

#### Parameters

##### applicationContext

`EventEmitter`

#### Returns

`void`

***

### setEventMap()

> **setEventMap**(`eventMap`): `void`

Configures the mapping of surface event names to application event names.
Only mapped events are forwarded.

#### Parameters

##### eventMap

`Record`\<`string`, `string`\>

A map of surface event names to application event names.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`setEventMap`](../../engine/interfaces/DOMViewTarget.md#seteventmap)

***

### unlisten()

> **unlisten**(): `void`

#### Returns

`void`
