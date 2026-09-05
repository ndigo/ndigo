[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ViewTarget

# Interface: ViewTarget

Defined in: [packages/blue-view/src/view-target.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-target.ts#lines-13)

Destination that receives rendered view output.

Targets abstract the rendering surface so engines can write to DOM nodes,
iframes, streams, or other host-specific outputs.

## Extended by

- [`EventBridgeViewTarget`](EventBridgeViewTarget.md)

## Methods

### prepare()

> **prepare**(`route`): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-view/src/view-target.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-target.ts#lines-20)

Prepares the target for rendering (e.g., clearing previous content).

#### Parameters

##### route

[`Route`](#)

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when preparation completes.

***

### commit()

> **commit**(`output`, `model`, `route`): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-view/src/view-target.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-target.ts#lines-31)

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

[`Route`](#)

The route being rendered.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when the output has been committed.

***

### clear()

> **clear**(): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-view/src/view-target.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-target.ts#lines-38)

Cleans up the ViewTarget.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves when cleanup completes.
