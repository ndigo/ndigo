[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / resolveJobRequest

# Function: resolveJobRequest()

> **resolveJobRequest**(`request`, `now`): [`ResolvedJobRequest`](../interfaces/ResolvedJobRequest.md)

Validates a producer request and resolves its defaults against `now`
(`runAt ?? now + delayMs ?? now`, `maxAttempts ?? DEFAULT_MAX_ATTEMPTS`).

Throws for: a non-object request, an empty `type`, `delayMs` together with
`runAt`, negative/non-finite times, and non-integer attempt/timeout values.

## Parameters

### request

[`JobRequest`](../interfaces/JobRequest.md)

The producer-supplied request.

### now

`number`

Current epoch milliseconds (injected for determinism).

## Returns

[`ResolvedJobRequest`](../interfaces/ResolvedJobRequest.md)

The normalized request drivers store.
