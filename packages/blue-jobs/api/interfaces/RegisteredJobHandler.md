[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / RegisteredJobHandler

# Interface: RegisteredJobHandler

One registered handler, ready to execute.

## Since

1.0.0

## Properties

### maxAttempts?

> `optional` **maxAttempts?**: `number`

***

### name

> **name**: `string`

`<beanName>.<methodName>` — diagnostics and spans.

***

### run

> **run**: [`JobHandler`](../type-aliases/JobHandler.md)

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

***

### type

> **type**: `string`

The job type served.
