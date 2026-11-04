[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / EventBridgeViewTarget

# Interface: EventBridgeViewTarget

View target that forwards surface events back into the application layer.

## Extends

- [`ViewTarget`](ViewTarget.md)

## Methods

### clear()

> **clear**(): `void` \| `Promise`\<`void`\>

Cleans up the ViewTarget.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup completes.

#### Inherited from

[`ViewTarget`](ViewTarget.md).[`clear`](ViewTarget.md#clear)

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

[`ViewTarget`](ViewTarget.md).[`commit`](ViewTarget.md#commit)

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

[`ViewTarget`](ViewTarget.md).[`prepare`](ViewTarget.md#prepare)

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
