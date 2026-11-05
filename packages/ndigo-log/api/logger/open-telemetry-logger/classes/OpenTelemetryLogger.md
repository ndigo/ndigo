[**@ndigo/log v0.0.1**](../../../README.md)

***

[@ndigo/log](../../../README.md) / [logger/open-telemetry-logger](../README.md) / OpenTelemetryLogger

# Class: OpenTelemetryLogger

Defines the interface for a logger that supports different severity levels and structured logging.

Implementations of this interface are responsible for processing and emitting log entries,
potentially integrating with OpenTelemetry logging systems.

## Implements

- [`Logger`](../../logger/interfaces/Logger.md)

## Constructors

### Constructor

> **new OpenTelemetryLogger**(`name`, `threshold?`): `OpenTelemetryLogger`

#### Parameters

##### name

`string`

##### threshold?

`SeverityNumber` = `SeverityNumber.DEBUG`

#### Returns

`OpenTelemetryLogger`

## Accessors

### threshold

#### Get Signature

> **get** **threshold**(): `SeverityNumber`

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

##### Returns

`SeverityNumber`

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`threshold`](../../logger/interfaces/Logger.md#threshold)

## Methods

### debug()

> **debug**(`message`, `attributes?`): `void`

Logs a message with `DEBUG` severity.

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

Logs a message with `ERROR` severity.

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

Logs a message with `INFO` severity.

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

Checks if logging is enabled for a given severity number.

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

Sets the minimum severity level for log messages.

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

Logs a message with `WARN` severity.

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
