[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-targeter](../README.md) / ViewTargeter

# Interface: ViewTargeter

Chooses the destination for one render pass.

Targeters select *where* output is written, never *which representation*
is produced — that remains the view-resolver chain's job. Returning `null`
declines, handing the decision to the next targeter in the chain.

## Methods

### resolveViewTarget()

> **resolveViewTarget**(`context`): [`ViewTarget`](../../view-target/interfaces/ViewTarget.md) \| `Promise`\<[`ViewTarget`](../../view-target/interfaces/ViewTarget.md) \| `null`\> \| `null`

Resolves the target for the given render pass.

#### Parameters

##### context

[`ViewTargetingContext`](ViewTargetingContext.md)

The render pass being targeted.

#### Returns

[`ViewTarget`](../../view-target/interfaces/ViewTarget.md) \| `Promise`\<[`ViewTarget`](../../view-target/interfaces/ViewTarget.md) \| `null`\> \| `null`

The target, or `null` to defer to the next targeter.
