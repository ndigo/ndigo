[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / resolvePreHandleOutcome

# Function: resolvePreHandleOutcome()

> **resolvePreHandleOutcome**(`route`, `outcome`): `boolean`

Normalizes a `preHandle` outcome: `true` allows; `false` is the default
denial; an [InterceptorDenial](../interfaces/InterceptorDenial.md) is an explicit denial (stored on the
route). Both denials return `false` for chain compatibility.

## Parameters

### route

[`Route`](#)

### outcome

`boolean` \| [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

## Returns

`boolean`
