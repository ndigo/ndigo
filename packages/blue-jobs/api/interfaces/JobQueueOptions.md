[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / JobQueueOptions

# Interface: JobQueueOptions

Options for [JobQueue](../classes/JobQueue.md).

## Since

1.0.0

## Properties

### driver?

> `optional` **driver?**: [`JobDriver`](JobDriver.md)

The driver jobs are enqueued on. When omitted, the queue resolves the
`jobDriver` bean from its application context at first use.

***

### maxAttempts?

> `optional` **maxAttempts?**: `number`

Default `maxAttempts` for requests that do not set one; default 3.
