[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job-handler-registry](../README.md) / RegisteredJobHandler

# Interface: RegisteredJobHandler

One registered handler, ready to execute.

## Properties

### maxAttempts?

> `optional` **maxAttempts?**: `number`

***

### name

> **name**: `string`

`<beanName>.<methodName>` — diagnostics and spans.

***

### run

> **run**: [`JobHandler`](../../job-handler/type-aliases/JobHandler.md)

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

***

### type

> **type**: `string`

The job type served.
