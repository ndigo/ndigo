[**@ndigo/log v0.0.1**](../README.md)

***

[@ndigo/log](../README.md) / Logger

# Interface: Logger

Defines the interface for a logger that supports different severity levels and structured logging.

Implementations of this interface are responsible for processing and emitting log entries,
potentially integrating with OpenTelemetry logging systems.

## Properties

### threshold

> `readonly` **threshold**: `SeverityNumber`

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

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
