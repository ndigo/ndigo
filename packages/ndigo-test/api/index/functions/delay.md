[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [index](../README.md) / delay

# Function: delay()

> **delay**(`ms`): `Promise`\<`void`\>

Resolves after `ms` milliseconds.

The single shared timing helper for async specs: waits on the ambient timer
queue, so under `vi.useFakeTimers()` the wait settles only when the spec
advances time (`vi.advanceTimersByTimeAsync`). Re-exported by `@ndigo/test`
for harness consumers; packages the harness itself depends on (e.g.
`@ndigo/platform-node`) import it here directly so the workspace stays
acyclic.

## Parameters

### ms

`number`

Milliseconds to wait.

## Returns

`Promise`\<`void`\>

A promise resolving once the delay has elapsed.
