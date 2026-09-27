[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / ViewTarget

# Interface: ViewTarget

Destination that receives rendered view output.

Targets abstract the rendering surface so engines can write to DOM nodes,
iframes, streams, or other host-specific outputs.

## Extended by

- [`EventBridgeViewTarget`](EventBridgeViewTarget.md)

## Methods

### clear()

> **clear**(): `void` \| `Promise`\<`void`\>

Cleans up the ViewTarget.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup completes.

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
