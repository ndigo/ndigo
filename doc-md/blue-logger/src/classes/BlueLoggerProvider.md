[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / BlueLoggerProvider

# Class: BlueLoggerProvider

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:75

BlueLoggerProvider wraps OpenTelemetry's LoggerProvider to provide
blue-logger conventions and backward compatibility with the Appender system.

## Example

```typescript
import { BlueLoggerProvider, ConsoleExporter } from '@blue/logger';

const provider = new BlueLoggerProvider({
  processors: [
    new SimpleLogRecordProcessor(new ConsoleExporter())
  ]
});

const logger = provider.getLogger('my-app');
logger.info('Application started');
```

## Implements

- `LoggerProvider`

## Constructors

### Constructor

> **new BlueLoggerProvider**(`config`): `BlueLoggerProvider`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:83

#### Parameters

##### config

[`BlueLoggerProviderConfig`](../interfaces/BlueLoggerProviderConfig.md) = `{}`

#### Returns

`BlueLoggerProvider`

## Methods

### getLogger()

> **getLogger**(`name`, `version?`, `options?`): `Logger`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:115

Get an OpenTelemetry Logger

#### Parameters

##### name

`string`

Logger name (typically component or module name)

##### version?

`string`

Logger version

##### options?

`LoggerOptions`

Logger options

#### Returns

`Logger`

OpenTelemetry Logger instance

#### Implementation of

`LoggerProvider.getLogger`

***

### createLogger()

> **createLogger**(`name`, `version?`): [`Logger`](../interfaces/Logger.md)

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:135

Create a blue-logger Logger backed by OpenTelemetry

This is a convenience method that wraps getLogger() and returns a
Logger instance compatible with the blue-logger interface.

#### Parameters

##### name

`string`

Logger name

##### version?

`string`

Logger version

#### Returns

[`Logger`](../interfaces/Logger.md)

blue-logger Logger instance

#### Example

```typescript
const logger = provider.createLogger('my-app');
logger.info('Using blue-logger interface');
```

***

### fromAppenders()

> `static` **fromAppenders**(`appenders`, `config`): `BlueLoggerProvider`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:163

Create a BlueLoggerProvider with Appender-based processors (backward compatibility)

This static factory method allows existing code using Appenders to work with
the new OTel architecture. Each Appender is wrapped in an AppenderLogRecordExporter.

NOTE: In OpenTelemetry SDK v0.211.0, processors must be configured at construction time.
If you need to use appenders, create a provider with this method.

#### Parameters

##### appenders

[`Appender`](../interfaces/Appender.md)[]

Array of blue-logger Appenders

##### config

`Omit`\<[`BlueLoggerProviderConfig`](../interfaces/BlueLoggerProviderConfig.md), `"processors"`\> = `{}`

Optional provider configuration

#### Returns

`BlueLoggerProvider`

BlueLoggerProvider configured with appenders

#### Example

```typescript
import { ConsoleAppender } from '@blue/logger';

const provider = BlueLoggerProvider.fromAppenders([
  new ConsoleAppender()
]);
const logger = provider.createLogger('my-app');
```

***

### getSDKProvider()

> **getSDKProvider**(): `LoggerProvider`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:183

Get the underlying SDK LoggerProvider

#### Returns

`LoggerProvider`

The OpenTelemetry SDK LoggerProvider instance

***

### getResource()

> **getResource**(): `Resource`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:192

Get the resource associated with this provider

#### Returns

`Resource`

The Resource instance

***

### getProcessors()

> **getProcessors**(): `LogRecordProcessor`[]

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:201

Get all registered processors

#### Returns

`LogRecordProcessor`[]

Array of LogRecordProcessor instances

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:210

Shutdown the provider and flush all pending log records

#### Returns

`Promise`\<`void`\>

Promise that resolves when shutdown is complete

***

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:219

Force flush all pending log records

#### Returns

`Promise`\<`void`\>

Promise that resolves when flush is complete
