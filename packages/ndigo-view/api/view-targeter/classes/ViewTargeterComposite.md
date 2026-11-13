[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-targeter](../README.md) / ViewTargeterComposite

# Class: ViewTargeterComposite

Ordered targeter chain: the first non-`null` target wins and later
targeters are not consulted.

Ordering is therefore policy — put the most specific targeter first. A
catch-all placed last deliberately makes the platform's fallback target
unreachable.

## Implements

- [`ViewTargeter`](../interfaces/ViewTargeter.md)

## Constructors

### Constructor

> **new ViewTargeterComposite**(`viewTargeters?`): `ViewTargeterComposite`

Creates a composite targeter over the given delegate list.

#### Parameters

##### viewTargeters?

[`ViewTargeter`](../interfaces/ViewTargeter.md)[] = `[]`

The targeters to query in order.

#### Returns

`ViewTargeterComposite`

## Properties

### viewTargeters

> `readonly` **viewTargeters**: [`ViewTargeter`](../interfaces/ViewTargeter.md)[]

The ordered targeter chain consulted during resolution.

## Methods

### resolveViewTarget()

> **resolveViewTarget**(`context`): `Promise`\<[`ViewTarget`](../../view-target/interfaces/ViewTarget.md) \| `null`\>

Resolves the target by querying delegates in order.

Delegates may be synchronous or asynchronous; `await` normalizes both,
so no `instanceof Promise` probing is needed (and none would survive a
cross-realm promise).

#### Parameters

##### context

[`ViewTargetingContext`](../interfaces/ViewTargetingContext.md)

The render pass being targeted.

#### Returns

`Promise`\<[`ViewTarget`](../../view-target/interfaces/ViewTarget.md) \| `null`\>

The first resolved target, or `null` when every delegate declines.

#### Implementation of

[`ViewTargeter`](../interfaces/ViewTargeter.md).[`resolveViewTarget`](../interfaces/ViewTargeter.md#resolveviewtarget)
