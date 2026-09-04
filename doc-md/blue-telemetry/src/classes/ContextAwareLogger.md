[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / ContextAwareLogger

# Class: ContextAwareLogger

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:12

A decorator logger that automatically injects OpenTelemetry trace and span IDs into log attributes
if an active span is present in the current context.

This logger wraps an existing `Logger` instance and enhances its logging methods
by adding `traceId` and `spanId` to the `LogAttributes` before passing them to the wrapped logger.

## Implements

- [`Logger`](../interfaces/Logger.md)

## Constructors

### Constructor

> **new ContextAwareLogger**(`logger`): `ContextAwareLogger`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:17

Creates an instance of `ContextAwareLogger`.

#### Parameters

##### logger

[`Logger`](../interfaces/Logger.md)

The underlying `Logger` instance to wrap.

#### Returns

`ContextAwareLogger`

## Accessors

### threshold

#### Get Signature

> **get** **threshold**(): `SeverityNumber`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:22

Gets the minimum severity level for log messages, delegated to the wrapped logger.

##### Returns

`SeverityNumber`

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`threshold`](../interfaces/Logger.md#threshold)

## Methods

### setThreshold()

> **setThreshold**(`threshold`): `void`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:30

Sets the minimum severity level for log messages, delegated to the wrapped logger.

#### Parameters

##### threshold

`SeverityNumber`

The new minimum `SeverityNumber`.

#### Returns

`void`

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`setThreshold`](../interfaces/Logger.md#setthreshold)

***

### isEnabled()

> **isEnabled**(`severityNumber`): `boolean`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:39

Checks if logging is enabled for a given severity number, delegated to the wrapped logger.

#### Parameters

##### severityNumber

`SeverityNumber`

The `SeverityNumber` to check.

#### Returns

`boolean`

`true` if logging is enabled for the specified severity, `false` otherwise.

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`isEnabled`](../interfaces/Logger.md#isenabled)

***

### debug()

> **debug**(`message`, `attributes?`): `void`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:48

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

[`Logger`](../interfaces/Logger.md).[`debug`](../interfaces/Logger.md#debug)

***

### info()

> **info**(`message`, `attributes?`): `void`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:57

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

[`Logger`](../interfaces/Logger.md).[`info`](../interfaces/Logger.md#info)

***

### warn()

> **warn**(`message`, `attributes?`): `void`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:66

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

[`Logger`](../interfaces/Logger.md).[`warn`](../interfaces/Logger.md#warn)

***

### error()

> **error**(`message`, `error?`, `attributes?`): `void`

Defined in: packages/blue-telemetry/src/logger/context-aware-logger.ts:76

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

[`Logger`](../interfaces/Logger.md).[`error`](../interfaces/Logger.md#error)
