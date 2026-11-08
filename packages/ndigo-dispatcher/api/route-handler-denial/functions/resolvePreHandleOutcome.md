[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-denial](../README.md) / resolvePreHandleOutcome

# Function: resolvePreHandleOutcome()

> **resolvePreHandleOutcome**(`route`, `outcome`): `boolean`

Normalizes a `preHandle` outcome: `true` allows; `false` is the default
denial; an [InterceptorDenial](../interfaces/InterceptorDenial.md) is an explicit denial (stored on the
route). Both denials return `false` for chain compatibility.

## Parameters

### route

[`Route`](#)

The route being processed.

### outcome

`boolean` \| [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

The interceptor's `preHandle` outcome.

## Returns

`boolean`

`true` when processing should continue.
