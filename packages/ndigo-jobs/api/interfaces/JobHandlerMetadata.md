[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / JobHandlerMetadata

# Interface: JobHandlerMetadata

The registration `@jobHandler` records for a method.

## Since

1.0.0

## Extends

- [`JobHandlerOptions`](JobHandlerOptions.md)

## Properties

### maxAttempts?

> `optional` **maxAttempts?**: `number`

Attempts allowed before the job is failed terminally.

#### Inherited from

[`JobHandlerOptions`](JobHandlerOptions.md).[`maxAttempts`](JobHandlerOptions.md#maxattempts)

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Per-execution timeout handed to the handler as an abort signal.

#### Inherited from

[`JobHandlerOptions`](JobHandlerOptions.md).[`timeoutMs`](JobHandlerOptions.md#timeoutms)

***

### type

> **type**: `string`

Job type this handler serves.
