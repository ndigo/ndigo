[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job-handler](../README.md) / JobHandler

# Type Alias: JobHandler

> **JobHandler** = (`payload`, `context`) => `void` \| `Promise`\<`void`\>

A job handler: receives the payload and execution context, resolves when
the work is done. Failures (throw / rejection) drive the retry policy.

## Parameters

### payload

`unknown`

### context

[`JobHandlerContext`](../interfaces/JobHandlerContext.md)

## Returns

`void` \| `Promise`\<`void`\>
