[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / DOMViewTarget

# Interface: DOMViewTarget

View target contract for DOM-backed render destinations.

It extends the shared event-bridge target with a concrete host node so the
target can reuse or replace the rendered subtree.

## Extends

- `EventBridgeViewTarget`

## Properties

### container

> `readonly` **container**: [`RenderHost`](../type-aliases/RenderHost.md)

The host node that receives rendered output.

## Methods

### clear()

> **clear**(): `void` \| `Promise`\<`void`\>

Cleans up the ViewTarget.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup completes.

#### Inherited from

`EventBridgeViewTarget.clear`

***

### commit()

> **commit**(`output`, `model`, `route`): `void` \| `Promise`\<`void`\>

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

[`Route`](#)

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when the output has been committed.

#### Inherited from

`EventBridgeViewTarget.commit`

***

### prepare()

> **prepare**(`route`): `void` \| `Promise`\<`void`\>

Prepares the target for rendering (e.g., clearing previous content).

#### Parameters

##### route

[`Route`](#)

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when preparation completes.

#### Inherited from

`EventBridgeViewTarget.prepare`

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

#### Inherited from

`EventBridgeViewTarget.setEventMap`
