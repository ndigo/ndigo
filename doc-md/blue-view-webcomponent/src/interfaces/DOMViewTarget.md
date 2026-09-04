[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / DOMViewTarget

# Interface: DOMViewTarget

Defined in: packages/blue-view-webcomponent/src/engine.ts:22

View target contract for DOM-backed render destinations.

It extends the shared event-bridge target with a concrete container element so the
engine can reuse or replace the rendered subtree.

## Extends

- `EventBridgeViewTarget`

## Properties

### container

> `readonly` **container**: `HTMLElement`

Defined in: packages/blue-view-webcomponent/src/engine.ts:26

The host element that receives rendered output.

## Methods

### prepare()

> **prepare**(`route`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/lib/view-target.d.ts:18

Prepares the target for rendering (e.g., clearing previous content).

#### Parameters

##### route

`Route`

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when preparation completes.

#### Inherited from

`EventBridgeViewTarget.prepare`

***

### commit()

> **commit**(`output`, `model`, `route`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/lib/view-target.d.ts:28

Commits the rendered output to the target.
The type of `output` depends on the View engine (e.g., HTMLElement, string).

#### Parameters

##### output

`any`

The rendered output.

##### model

`any`

The model used to produce the output.

##### route

`Route`

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when the output has been committed.

#### Inherited from

`EventBridgeViewTarget.commit`

***

### clear()

> **clear**(): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/lib/view-target.d.ts:34

Cleans up the ViewTarget.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup completes.

#### Inherited from

`EventBridgeViewTarget.clear`

***

### setEventMap()

> **setEventMap**(`eventMap`): `void`

Defined in: packages/blue-view/lib/view-target.d.ts:46

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
