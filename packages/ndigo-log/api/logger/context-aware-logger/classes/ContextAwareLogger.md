[**@ndigo/log v0.0.1**](../../../README.md)

***

[@ndigo/log](../../../README.md) / [logger/context-aware-logger](../README.md) / ContextAwareLogger

# Class: ContextAwareLogger

A decorator logger that automatically injects OpenTelemetry trace and span IDs into log attributes
if an active span is present in the current context.

This logger wraps an existing `Logger` instance and enhances its logging methods
by adding `traceId` and `spanId` to the `LogAttributes` before passing them to the wrapped logger.

## Implements

- [`Logger`](../../logger/interfaces/Logger.md)

## Constructors

### Constructor

> **new ContextAwareLogger**(`logger`): `ContextAwareLogger`

Creates an instance of `ContextAwareLogger`.

#### Parameters

##### logger

[`Logger`](../../logger/interfaces/Logger.md)

The underlying `Logger` instance to wrap.

#### Returns

`ContextAwareLogger`

## Accessors

### threshold

#### Get Signature

> **get** **threshold**(): `SeverityNumber`

Gets the minimum severity level for log messages, delegated to the wrapped logger.

##### Returns

`SeverityNumber`

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`threshold`](../../logger/interfaces/Logger.md#threshold)

## Methods

### debug()

> **debug**(`message`, `attributes?`): `void`

Logs a message with `DEBUG` severity, injecting trace context into attributes.

#### Parameters

##### message

`string`

The log message.

##### attributes?

`Attributes`

Optional attributes to associate with the log entry.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`debug`](../../logger/interfaces/Logger.md#debug)

***

### error()

> **error**(`message`, `error?`, `attributes?`): `void`

Logs a message with `ERROR` severity, injecting trace context into attributes.

#### Parameters

##### message

`string`

The log message.

##### error?

`Exception`

Optional. An `Exception` object to associate with the log entry.

##### attributes?

`Attributes`

Optional attributes to associate with the log entry.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`error`](../../logger/interfaces/Logger.md#error)

***

### info()

> **info**(`message`, `attributes?`): `void`

Logs a message with `INFO` severity, injecting trace context into attributes.

#### Parameters

##### message

`string`

The log message.

##### attributes?

`Attributes`

Optional attributes to associate with the log entry.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`info`](../../logger/interfaces/Logger.md#info)

***

### isEnabled()

> **isEnabled**(`severityNumber`): `boolean`

Checks if logging is enabled for a given severity number, delegated to the wrapped logger.

#### Parameters

##### severityNumber

`SeverityNumber`

The `SeverityNumber` to check.

#### Returns

`boolean`

`true` if logging is enabled for the specified severity, `false` otherwise.

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`isEnabled`](../../logger/interfaces/Logger.md#isenabled)

***

### setThreshold()

> **setThreshold**(`threshold`): `void`

Sets the minimum severity level for log messages, delegated to the wrapped logger.

#### Parameters

##### threshold

`SeverityNumber`

The new minimum `SeverityNumber`.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`setThreshold`](../../logger/interfaces/Logger.md#setthreshold)

***

### warn()

> **warn**(`message`, `attributes?`): `void`

Logs a message with `WARN` severity, injecting trace context into attributes.

#### Parameters

##### message

`string`

The log message.

##### attributes?

`Attributes`

Optional attributes to associate with the log entry.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`warn`](../../logger/interfaces/Logger.md#warn)
