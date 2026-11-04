[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / scheduled

# Function: scheduled()

> **scheduled**(`spec`): (`value`, `context`) => `void`

Marks a method as a scheduled task (AD-20 D1).

Node-only: the decorator refuses to apply in environments without a
`process` global (genuine browsers). Bundlers that polyfill `process` can
evade the runtime check — the `no-scheduled-in-browser` lint rule covers
repository code and docs cover the rest (AD-20 D5.3).

## Parameters

### spec

[`ScheduledSpec`](../type-aliases/ScheduledSpec.md)

A cron string, `{ cron }`, or `{ fixedRate | fixedDelay }`
  specification (with optional `timeZone` and `maxRunTime`).

## Returns

The class method decorator.

(`value`, `context`) => `void`
