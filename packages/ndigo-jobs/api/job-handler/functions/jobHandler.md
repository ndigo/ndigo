[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job-handler](../README.md) / jobHandler

# Function: jobHandler()

> **jobHandler**(`type`, `options?`): (`value`, `context`) => `void`

Marks a method as the handler for one job type (AD-72 D-5).

Node-only: the decorator refuses to apply in environments without a
`process` global (genuine browsers) — jobs run on the server.

## Parameters

### type

`string`

Non-empty job type string; duplicates fail loud at scan time.

### options?

[`JobHandlerOptions`](../interfaces/JobHandlerOptions.md) = `{}`

Optional `maxAttempts`/`timeoutMs` overrides.

## Returns

The class method decorator.

(`value`, `context`) => `void`
