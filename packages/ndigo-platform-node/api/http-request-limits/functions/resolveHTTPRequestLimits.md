[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [http-request-limits](../README.md) / resolveHTTPRequestLimits

# Function: resolveHTTPRequestLimits()

> **resolveHTTPRequestLimits**(`limits?`): [`ResolvedHTTPRequestLimits`](../interfaces/ResolvedHTTPRequestLimits.md)

Validates and resolves user-provided limits, filling defaults. Throws a
`RangeError` for non-positive or non-finite values.

## Parameters

### limits?

[`HTTPRequestLimits`](../interfaces/HTTPRequestLimits.md)

The user-provided limits.

## Returns

[`ResolvedHTTPRequestLimits`](../interfaces/ResolvedHTTPRequestLimits.md)

The resolved limits with defaults applied.
