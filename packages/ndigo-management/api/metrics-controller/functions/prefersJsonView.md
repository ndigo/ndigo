[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [metrics-controller](../README.md) / prefersJsonView

# Function: prefersJsonView()

> **prefersJsonView**(`accept`): `boolean`

Whether an `Accept` header explicitly prefers the JSON projection (AD-77
D-4): the single best-acceptable entry decides, ties keep header order,
malformed weights fall back to `1`. A JSON media type
(`application/json` or any `application/*+json` suffix) selects JSON;
everything else — absent headers, wildcard accepts, `text/plain`,
browsers — selects the Prometheus text document.

## Parameters

### accept

`string` \| `undefined`

## Returns

`boolean`
