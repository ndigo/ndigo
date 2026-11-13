[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-targeter](../README.md) / FixedViewTargeter

# Class: FixedViewTargeter

Always resolves to the same target.

Intended for tests, single-surface applications, and platforms whose
destination is fixed for the application's lifetime. It is not a fallback:
the dispatcher's registered `VIEW_TARGET` already plays that role.

## Implements

- [`ViewTargeter`](../interfaces/ViewTargeter.md)

## Constructors

### Constructor

> **new FixedViewTargeter**(`target`): `FixedViewTargeter`

Creates a targeter over a fixed target.

#### Parameters

##### target

[`ViewTarget`](../../view-target/interfaces/ViewTarget.md)

The target to resolve to.

#### Returns

`FixedViewTargeter`

## Properties

### target

> `readonly` **target**: [`ViewTarget`](../../view-target/interfaces/ViewTarget.md)

The target this targeter always returns.

## Methods

### resolveViewTarget()

> **resolveViewTarget**(`_context`): [`ViewTarget`](../../view-target/interfaces/ViewTarget.md)

Returns the fixed target.

#### Parameters

##### \_context

[`ViewTargetingContext`](../interfaces/ViewTargetingContext.md)

The render pass being targeted (unused: the target is
  fixed for the lifetime of this targeter).

#### Returns

[`ViewTarget`](../../view-target/interfaces/ViewTarget.md)

The configured target.

#### Implementation of

[`ViewTargeter`](../interfaces/ViewTargeter.md).[`resolveViewTarget`](../interfaces/ViewTargeter.md#resolveviewtarget)
