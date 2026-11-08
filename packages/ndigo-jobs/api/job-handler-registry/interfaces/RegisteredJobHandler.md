[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job-handler-registry](../README.md) / RegisteredJobHandler

# Interface: RegisteredJobHandler

One registered handler, ready to execute.

## Properties

### maxAttempts?

> `optional` **maxAttempts?**: `number`

Attempts allowed before terminal failure, when declared.

***

### name

> **name**: `string`

`<beanName>.<methodName>` — diagnostics and spans.

***

### run

> **run**: [`JobHandler`](../../job-handler/type-aliases/JobHandler.md)

The handler function.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Per-execution timeout, when declared.

***

### type

> **type**: `string`

The job type served.
