[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / BlueLoggerProviderConfig

# Interface: BlueLoggerProviderConfig

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:21

Configuration options for BlueLoggerProvider

## Properties

### resource?

> `optional` **resource**: `Resource`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:26

Resource to associate with all loggers
Describes the entity producing logs (service name, version, etc.)

***

### processors?

> `optional` **processors**: `LogRecordProcessor`[]

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:32

Log record processors to use
Processors handle batching, filtering, and exporting of log records

***

### mergeResourceWithGlobal?

> `optional` **mergeResourceWithGlobal**: `boolean`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:38

Whether to merge with global resource
Default: true

***

### scopeName?

> `optional` **scopeName**: `string`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:44

Instrumentation scope name for loggers
Default: '@blue/logger'

***

### scopeVersion?

> `optional` **scopeVersion**: `string`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:49

Instrumentation scope version

***

### schemaUrl?

> `optional` **schemaUrl**: `string`

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:54

Schema URL for instrumentation scope
