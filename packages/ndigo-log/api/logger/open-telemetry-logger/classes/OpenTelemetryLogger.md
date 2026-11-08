[**@ndigo/log v0.0.1**](../../../README.md)

***

[@ndigo/log](../../../README.md) / [logger/open-telemetry-logger](../README.md) / OpenTelemetryLogger

# Class: OpenTelemetryLogger

Logger that emits records through the OpenTelemetry logs API.

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

The current minimum severity.

##### Returns

`SeverityNumber`

The minimum severity level for log messages to be processed by this logger.
Messages with a severity lower than this threshold will be ignored.

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`threshold`](../../logger/interfaces/Logger.md#threshold)

## Methods

### debug()

> **debug**(`message`, `attributes?`): `void`

Logs a debug message.

#### Parameters

##### message

`string`

The message body.

##### attributes?

`Attributes`

Optional structured attributes.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`debug`](../../logger/interfaces/Logger.md#debug)

***

### error()

> **error**(`message`, `error?`, `attributes?`): `void`

Logs an error message and records the exception on the active span.

#### Parameters

##### message

`string`

The message body.

##### error?

`Exception`

Optional exception attached to the log.

##### attributes?

`Attributes`

Optional structured attributes.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`error`](../../logger/interfaces/Logger.md#error)

***

### info()

> **info**(`message`, `attributes?`): `void`

Logs an info message.

#### Parameters

##### message

`string`

The message body.

##### attributes?

`Attributes`

Optional structured attributes.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`info`](../../logger/interfaces/Logger.md#info)

***

### isEnabled()

> **isEnabled**(`severityNumber`): `boolean`

Whether a severity passes the current threshold.

#### Parameters

##### severityNumber

`SeverityNumber`

The severity to test.

#### Returns

`boolean`

`true` when the severity is enabled.

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`isEnabled`](../../logger/interfaces/Logger.md#isenabled)

***

### setThreshold()

> **setThreshold**(`threshold`): `void`

Sets the minimum severity.

#### Parameters

##### threshold

`SeverityNumber`

The new minimum severity.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`setThreshold`](../../logger/interfaces/Logger.md#setthreshold)

***

### warn()

> **warn**(`message`, `attributes?`): `void`

Logs a warning message.

#### Parameters

##### message

`string`

The message body.

##### attributes?

`Attributes`

Optional structured attributes.

#### Returns

`void`

#### Implementation of

[`Logger`](../../logger/interfaces/Logger.md).[`warn`](../../logger/interfaces/Logger.md#warn)
