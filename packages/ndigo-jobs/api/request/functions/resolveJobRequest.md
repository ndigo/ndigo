[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [request](../README.md) / resolveJobRequest

# Function: resolveJobRequest()

> **resolveJobRequest**(`request`, `now`): [`ResolvedJobRequest`](../../job/interfaces/ResolvedJobRequest.md)

Validates a producer request and resolves its defaults against `now`
(`runAt ?? now + delayMs ?? now`, `maxAttempts ?? DEFAULT_MAX_ATTEMPTS`).

Throws for: a non-object request, an empty `type`, `delayMs` together with
`runAt`, negative/non-finite times, and non-integer attempt/timeout values.

## Parameters

### request

[`JobRequest`](../../job/interfaces/JobRequest.md)

The producer-supplied request.

### now

`number`

Current epoch milliseconds (injected for determinism).

## Returns

[`ResolvedJobRequest`](../../job/interfaces/ResolvedJobRequest.md)

The normalized request drivers store.
