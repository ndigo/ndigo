[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / gracefulShutdown

# Function: gracefulShutdown()

> **gracefulShutdown**(`context`, `options?`): () => `void`

Wire OS signals to a graceful shutdown of the given context and resources.

On the first matching signal the handler closes each resource in order, then
closes the context, then exits with [GracefulShutdownOptions.exitCode](../interfaces/GracefulShutdownOptions.md#exitcode).
A second signal while shutting down — or a teardown that exceeds
`timeoutMs` — force-exits with [GracefulShutdownOptions.abortExitCode](../interfaces/GracefulShutdownOptions.md#abortexitcode).

The handler is idempotent per process: the first signal wins; later signals
only escalate to a force-exit.

## Parameters

### context

`ApplicationContext`

The application context to close on shutdown.

### options?

[`GracefulShutdownOptions`](../interfaces/GracefulShutdownOptions.md) = `{}`

Shutdown configuration.

## Returns

A function that unregisters the signal listeners.

() => `void`
