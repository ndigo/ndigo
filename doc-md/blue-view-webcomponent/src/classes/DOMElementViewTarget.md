[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / DOMElementViewTarget

# Class: DOMElementViewTarget

Defined in: [packages/blue-view-webcomponent/src/engine.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-54)

View target implementation that renders into a host HTMLElement.

## Implements

- [`DOMViewTarget`](../interfaces/DOMViewTarget.md)

## Constructors

### Constructor

> **new DOMElementViewTarget**(`element`, `options?`): `DOMElementViewTarget`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-68)

Creates a DOM-backed view target for the provided element.

#### Parameters

##### element

`HTMLElement` \| `null`

The root element that will host rendered content.

##### options?

Event mapping used to bridge DOM events to the application context.

###### eventMap?

`Record`\<`string`, `string`\>

#### Returns

`DOMElementViewTarget`

#### Throws

When `element` is null or undefined.

## Properties

### destroyed

> **destroyed**: `boolean`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-59)

## Accessors

### container

#### Get Signature

> **get** **container**(): `HTMLElement`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-85)

The host element that receives rendered output.

##### Returns

`HTMLElement`

The host element that receives rendered output.

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`container`](../interfaces/DOMViewTarget.md#container)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:94](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-94)

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

Defined in: [packages/blue-view-webcomponent/src/engine.ts:107](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-107)

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

### listen()

> **listen**(): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-120)

Installs DOM event listeners for the current event map.

Existing listeners are removed first so repeated calls stay idempotent.

#### Returns

`void`

***

### unlisten()

> **unlisten**(): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:141](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-141)

Removes all installed DOM event listeners from the host element.

#### Returns

`void`

***

### prepare()

> **prepare**(`route`): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:151](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-151)

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

### commit()

> **commit**(`output`, `model`, `route`): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:167](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-167)

Appends rendered output to the host element and re-enables event bridging.

#### Parameters

##### output

`HTMLElement`

The rendered DOM subtree to attach.

##### model

`any`

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

### clear()

> **clear**(): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:178](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-178)

Clears rendered content without permanently destroying the target.

#### Returns

`void`

#### Implementation of

[`DOMViewTarget`](../interfaces/DOMViewTarget.md).[`clear`](../interfaces/DOMViewTarget.md#clear)

***

### destroy()

> **destroy**(): `void`

Defined in: [packages/blue-view-webcomponent/src/engine.ts:189](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view-webcomponent/src/engine.ts#lines-189)

Permanently disables the target and releases its event listeners.

#### Returns

`void`
