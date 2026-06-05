[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / EventBridgeViewTarget

# Interface: EventBridgeViewTarget

Defined in: packages/blue-view/src/view-target.ts:44

View target that forwards surface events back into the application layer.

## Extends

- [`ViewTarget`](ViewTarget.md)

## Methods

### prepare()

> **prepare**(`route`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view-target.ts:20

Prepares the target for rendering (e.g., clearing previous content).

#### Parameters

##### route

`Route`

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when preparation completes.

#### Inherited from

[`ViewTarget`](ViewTarget.md).[`prepare`](ViewTarget.md#prepare)

***

### commit()

> **commit**(`output`, `model`, `route`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view-target.ts:31

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

[`ViewTarget`](ViewTarget.md).[`commit`](ViewTarget.md#commit)

***

### clear()

> **clear**(): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-view/src/view-target.ts:38

Cleans up the ViewTarget.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup completes.

#### Inherited from

[`ViewTarget`](ViewTarget.md).[`clear`](ViewTarget.md#clear)

***

### setEventMap()

> **setEventMap**(`eventMap`): `void`

Defined in: packages/blue-view/src/view-target.ts:51

Configures the mapping of surface event names to application event names.
Only mapped events are forwarded.

#### Parameters

##### eventMap

`Record`\<`string`, `string`\>

A map of surface event names to application event names.

#### Returns

`void`
