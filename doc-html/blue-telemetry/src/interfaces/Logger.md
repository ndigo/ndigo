[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / Logger

# Interface: Logger

Defined in: [packages/blue-telemetry/src/logger/logger.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-16)

Defines the interface for a logger that supports different severity levels and structured logging.

Implementations of this interface are responsible for processing and emitting log entries,
potentially integrating with OpenTelemetry logging systems.

## Properties

### threshold

> `readonly` **threshold**: `SeverityNumber`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-21)

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

## Methods

### setThreshold()

> **setThreshold**(`threshold`): `void`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-27)

Sets the minimum severity level for log messages.

#### Parameters

##### threshold

`SeverityNumber`

The new minimum `SeverityNumber`.

#### Returns

`void`

***

### isEnabled()

> **isEnabled**(`severityNumber`): `boolean`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-34)

Checks if logging is enabled for a given severity number.

#### Parameters

##### severityNumber

`SeverityNumber`

The `SeverityNumber` to check.

#### Returns

`boolean`

`true` if logging is enabled for the specified severity, `false` otherwise.

***

### debug()

> **debug**(`message`, `attributes?`): `void`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-41)

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

### info()

> **info**(`message`, `attributes?`): `void`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-48)

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

### warn()

> **warn**(`message`, `attributes?`): `void`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:55](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-55)

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

***

### error()

> **error**(`message`, `error?`, `attributes?`): `void`

Defined in: [packages/blue-telemetry/src/logger/logger.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/logger.ts#lines-63)

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
