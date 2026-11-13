[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [selector-view-targeter](../README.md) / ViewTargetSelector

# Type Alias: ViewTargetSelector

> **ViewTargetSelector** = (`context`) => `string` \| `null` \| `undefined`

Resolves a CSS selector for one render pass.

Returning `null` or `undefined` declines. The function may throw; the
targeter catches the error, logs at debug level, and declines, so a buggy
selector can never fail a render.

Selector text must come from static configuration. A selector derived from
request data must be escaped (`CSS.escape`) before interpolation.

## Parameters

### context

`ViewTargetingContext`

## Returns

`string` \| `null` \| `undefined`
