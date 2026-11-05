[**@ndigo/log v0.0.1**](../../../README.md)

***

[@ndigo/log](../../../README.md) / [logger/logger-factory](../README.md) / LoggerFactory

# Class: LoggerFactory

A static factory class for creating `Logger` instances.

This factory allows for global configuration of logger types, severity thresholds,
and whether loggers should be context-aware (e.g., integrating with OpenTelemetry contexts).
Configuration changes apply to every logger already handed out — loggers are
lazily-resolved handles, not frozen snapshots.

## Constructors

### Constructor

> **new LoggerFactory**(): `LoggerFactory`

#### Returns

`LoggerFactory`

## Methods

### clearLevel()

> `static` **clearLevel**(`name`): `void`

Removes a per-name threshold override, falling back to the global
settings for the name.

#### Parameters

##### name

`string`

The logger name.

#### Returns

`void`

***

### configuredLevel()

> `static` **configuredLevel**(`name`): `SeverityNumber` \| `undefined`

The per-name threshold override for a logger, when set.

#### Parameters

##### name

`string`

The logger name.

#### Returns

`SeverityNumber` \| `undefined`

The override severity, or `undefined`.

***

### effectiveLevel()

> `static` **effectiveLevel**(`name`): `SeverityNumber`

The effective threshold for a logger: the per-name override when set,
otherwise the current global threshold.

#### Parameters

##### name

`string`

The logger name.

#### Returns

`SeverityNumber`

The effective severity.

***

### getLogger()

> `static` **getLogger**(`name`): [`Logger`](../../logger/interfaces/Logger.md)

Creates and returns a `Logger` handle whose configuration follows this
factory's current and future global settings (plus any per-name
override, [LoggerFactory.setLevel](#setlevel)).

#### Parameters

##### name

`string`

The name of the logger.

#### Returns

[`Logger`](../../logger/interfaces/Logger.md)

A `Logger` instance.

***

### hasLogger()

> `static` **hasLogger**(`name`): `boolean`

Whether a logger with this name is known (requested or overridden).

#### Parameters

##### name

`string`

The logger name.

#### Returns

`boolean`

`true` when the name is known.

***

### loggerNames()

> `static` **loggerNames**(): readonly `string`[]

The logger names known to the factory — ever requested through
[LoggerFactory.getLogger](#getlogger) plus any name with a level override
(a `/loggers` POST names a logger without a handle, AD-76 D-7) —
sorted: the `/loggers` enumeration surface.

#### Returns

readonly `string`[]

The known logger names.

***

### reset()

> `static` **reset**(): `void`

Resets the `LoggerFactory` to its default configuration:
- Type: `'console'`
- Threshold: `SeverityNumber.DEBUG`
- Context-aware: `true`
- Per-name overrides and requested-name tracking: cleared (AD-76 D-7)

#### Returns

`void`

***

### setContextAware()

> `static` **setContextAware**(`enabled`): `void`

Enables or disables context-aware logging for all loggers.
When enabled, loggers will automatically include context information (e.g., trace IDs)
if an active OpenTelemetry context is available.

#### Parameters

##### enabled

`boolean`

`true` to enable context-aware logging, `false` to disable.

#### Returns

`void`

***

### setLevel()

> `static` **setLevel**(`name`, `level`): `void`

Sets a per-name threshold override (AD-76 D-7). Applies to every
handle for the name — including ones handed out before this call —
and survives global `setThreshold` calls until cleared.

#### Parameters

##### name

`string`

The logger name.

##### level

`SeverityNumber`

The threshold severity.

#### Returns

`void`

***

### setThreshold()

> `static` **setThreshold**(`threshold`): `void`

Sets the global minimum severity threshold for all loggers created by
this factory — including those already handed out.

#### Parameters

##### threshold

`SeverityNumber`

The new minimum `SeverityNumber`.

#### Returns

`void`

***

### setType()

> `static` **setType**(`type`): `void`

Sets the global logger type for all loggers created by this factory —
including those already handed out.

#### Parameters

##### type

[`LoggerType`](../type-aliases/LoggerType.md)

The desired `LoggerType`.

#### Returns

`void`
