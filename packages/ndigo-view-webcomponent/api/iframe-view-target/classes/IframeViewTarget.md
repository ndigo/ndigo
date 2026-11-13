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

Clears the iframe document without destroying the target.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`clear`](../../engine/interfaces/DOMViewTarget.md#clear)

***

### commit()

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

Commits rendered output to the iframe document, loading it first.

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

`Promise`\<`void`\>

A promise that resolves once the output is committed.

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`commit`](../../engine/interfaces/DOMViewTarget.md#commit)

***

### destroy()

> **destroy**(): `void`

Destroys the target and releases the iframe document's listeners.

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

> **prepare**(`route`): `Promise`\<`void`\>

Prepares the iframe document for a new render pass, loading it first.

#### Parameters

##### route

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route being rendered.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the document is ready.

#### Implementation of

[`DOMViewTarget`](../../engine/interfaces/DOMViewTarget.md).[`prepare`](../../engine/interfaces/DOMViewTarget.md#prepare)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Stores the application context and forwards it to the inner target.

The iframe document may not exist yet, so the context is stored and
applied when the inner target is created.

#### Parameters

##### applicationContext

`EventEmitter`

The application event emitter.

#### Returns

`void`

***

### setEventMap()

> **setEventMap**(`eventMap`): `void`

Stores the DOM event map and forwards it to the inner target.

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
