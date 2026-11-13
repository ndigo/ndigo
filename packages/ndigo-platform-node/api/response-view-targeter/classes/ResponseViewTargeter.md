[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [response-view-targeter](../README.md) / ResponseViewTargeter

# Class: ResponseViewTargeter

Resolves the per-request HTTP response target.

Node has one destination per request, so this targeter is the platform's
built-in chain entry: it always returns a fresh `HTTPResponseViewTarget`
over the response the HTTP adapter stored on the route. A result that
supplies its own target (`ModelAndView.viewTarget`) still wins, which is how
Node tests observe rendering and how streaming transports can redirect
output.

## Implements

- `ViewTargeter`

## Constructors

### Constructor

> **new ResponseViewTargeter**(): `ResponseViewTargeter`

#### Returns

`ResponseViewTargeter`

## Methods

### resolveViewTarget()

> **resolveViewTarget**(`context`): [`HTTPResponseViewTarget`](../../node-view-target/classes/HTTPResponseViewTarget.md)

Resolves the HTTP response target for the current route.

The target is created even when the route carries no response: its
`commit()` is a no-op in that case, which preserves the pre-targeter
behavior for dispatches that are not HTTP-backed (tests, tooling).

#### Parameters

##### context

`ViewTargetingContext`

The render pass being targeted.

#### Returns

[`HTTPResponseViewTarget`](../../node-view-target/classes/HTTPResponseViewTarget.md)

A fresh response target.

#### Implementation of

`ViewTargeter.resolveViewTarget`
