[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / LoggerFactory

# Class: LoggerFactory

Defined in: packages/blue-telemetry/src/logger/logger-factory.ts:45

A static factory class for creating `Logger` instances.

This factory allows for global configuration of logger types, severity thresholds,
and whether loggers should be context-aware (e.g., integrating with OpenTelemetry contexts).

## Constructors

### Constructor

> **new LoggerFactory**(): `LoggerFactory`

#### Returns

`LoggerFactory`

## Methods

### setType()

> `static` **setType**(`type`): `void`

Defined in: packages/blue-telemetry/src/logger/logger-factory.ts:54

Sets the global logger type for all subsequent loggers created by this factory.

#### Parameters

##### type

[`LoggerType`](../type-aliases/LoggerType.md)

The desired `LoggerType`.

#### Returns

`void`

***

### setThreshold()

> `static` **setThreshold**(`threshold`): `void`

Defined in: packages/blue-telemetry/src/logger/logger-factory.ts:62

Sets the global minimum severity threshold for all subsequent loggers created by this factory.

#### Parameters

##### threshold

`SeverityNumber`

The new minimum `SeverityNumber`.

#### Returns

`void`

***

### setContextAware()

> `static` **setContextAware**(`enabled`): `void`

Defined in: packages/blue-telemetry/src/logger/logger-factory.ts:72

Enables or disables context-aware logging for all subsequent loggers.
When enabled, loggers will automatically include context information (e.g., trace IDs)
if an active OpenTelemetry context is available.

#### Parameters

##### enabled

`boolean`

`true` to enable context-aware logging, `false` to disable.

#### Returns

`void`

***

### reset()

> `static` **reset**(): `void`

Defined in: packages/blue-telemetry/src/logger/logger-factory.ts:82

Resets the `LoggerFactory` to its default configuration:
- Type: `'console'`
- Threshold: `SeverityNumber.DEBUG`
- Context-aware: `true`

#### Returns

`void`

***

### getLogger()

> `static` **getLogger**(`name`): [`Logger`](../interfaces/Logger.md)

Defined in: packages/blue-telemetry/src/logger/logger-factory.ts:94

Creates and returns a `Logger` instance with the specified name,
configured according to the current global settings of the factory.

#### Parameters

##### name

`string`

The name of the logger.

#### Returns

[`Logger`](../interfaces/Logger.md)

A `Logger` instance.
