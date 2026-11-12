[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [iframe-view-target](../README.md) / IframeViewTarget

# Class: IframeViewTarget

A view target that renders into the document of a same-origin `<iframe>`.

Cross-origin (or sandboxed-without-`allow-same-origin`) iframes cannot be
rendered into and throw `IllegalStateError`.

## Implements

- [`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md)
- `Destroyable`

## Constructors

### Constructor

> **new IframeViewTarget**(`iframe`, `options?`): `IframeViewTarget`

Creates an iframe-backed view target.

#### Parameters

##### iframe

`HTMLIFrameElement` \| `null`

The iframe whose document will host rendered content.

##### options?

Event mapping used to bridge DOM events to the application context.

###### eventMap?

`Record`\<`string`, `string`\>

#### Returns

`IframeViewTarget`

#### Throws

When `iframe` is null/undefined.

## Accessors

### container

#### Get Signature

> **get** **container**(): [`RenderHost`](../../engine/type-aliases/RenderHost.md)

The host node that receives rendered content (the iframe, until loaded).

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

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

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

`Promise`\<`void`\>

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

> **prepare**(`route`): `Promise`\<`void`\>

Prepares the target for rendering (e.g., clearing previous content).

#### Parameters

##### route

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route being rendered.

#### Returns

`Promise`\<`void`\>

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
