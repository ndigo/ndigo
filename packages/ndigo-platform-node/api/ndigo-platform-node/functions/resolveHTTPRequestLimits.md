[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / resolveHTTPRequestLimits

# Function: resolveHTTPRequestLimits()

> **resolveHTTPRequestLimits**(`limits?`): [`ResolvedHTTPRequestLimits`](../interfaces/ResolvedHTTPRequestLimits.md)

Validates and resolves user-provided limits, filling defaults. Throws a
`RangeError` for non-positive or non-finite values.

## Parameters

### limits?

[`HTTPRequestLimits`](../interfaces/HTTPRequestLimits.md)

## Returns

[`ResolvedHTTPRequestLimits`](../interfaces/ResolvedHTTPRequestLimits.md)
