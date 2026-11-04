[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / GracefulShutdownOptions

# Interface: GracefulShutdownOptions

Options for [gracefulShutdown](../functions/gracefulShutdown.md).

## Properties

### abortExitCode?

> `optional` **abortExitCode?**: `number`

Process exit code when shutdown is aborted (second signal, a close that
throws, or the deadline elapsing).

#### Default

```ts
1
```

***

### exitCode?

> `optional` **exitCode?**: `number`

Process exit code after a clean shutdown.

#### Default

```ts
0
```

***

### resources?

> `optional` **resources?**: readonly [`Closable`](Closable.md)[]

Extra resources to close, in order, before the context. Typically the
application's [HTTPServer](../classes/HTTPServer.md).

#### Default

```ts
[]
```

***

### signals?

> `optional` **signals?**: `Signals`[]

Signals to listen for.

#### Default

```ts
['SIGINT', 'SIGTERM']
```

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Force-exit deadline (ms) for the whole teardown. Guards against a close
that never completes (e.g. in-flight connections that never drain).

#### Default

```ts
10_000
```
