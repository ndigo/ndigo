[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / resolveHTTPRequestLimits

# Function: resolveHTTPRequestLimits()

> **resolveHTTPRequestLimits**(`limits?`): [`ResolvedHTTPRequestLimits`](../interfaces/ResolvedHTTPRequestLimits.md)

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-57)

Validates and resolves user-provided limits, filling defaults. Throws a
`RangeError` for non-positive or non-finite values.

## Parameters

### limits?

[`HTTPRequestLimits`](../interfaces/HTTPRequestLimits.md)

## Returns

[`ResolvedHTTPRequestLimits`](../interfaces/ResolvedHTTPRequestLimits.md)
