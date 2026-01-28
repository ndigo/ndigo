[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AppenderLogRecordExporter

# Class: AppenderLogRecordExporter

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:27

AppenderLogRecordExporter wraps a blue-logger Appender as an OpenTelemetry LogRecordExporter.

This adapter allows existing Appenders to work with the new OTel architecture,
providing a smooth migration path.

## Example

```typescript
import { ConsoleAppender } from '@blue/logger';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const appender = new ConsoleAppender();
const exporter = new AppenderLogRecordExporter(appender);
const processor = new SimpleLogRecordProcessor(exporter);
```

## Implements

- `LogRecordExporter`

## Constructors

### Constructor

> **new AppenderLogRecordExporter**(`appender`, `layout?`): `AppenderLogRecordExporter`

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:31

#### Parameters

##### appender

[`Appender`](../interfaces/Appender.md)

##### layout?

[`Layout`](../interfaces/Layout.md)

#### Returns

`AppenderLogRecordExporter`

## Methods

### export()

> **export**(`logs`, `resultCallback`): `void`

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:47

Export log records by converting them to Entries and passing to the Appender

#### Parameters

##### logs

`ReadableLogRecord`[]

Array of log records to export

##### resultCallback

(`result`) => `void`

Callback to invoke with export result

#### Returns

`void`

#### Implementation of

`LogRecordExporter.export`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:116

Shutdown the exporter

#### Returns

`Promise`\<`void`\>

#### Implementation of

`LogRecordExporter.shutdown`

***

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:126

Force flush any pending records

#### Returns

`Promise`\<`void`\>

***

### getAppender()

> **getAppender**(): [`Appender`](../interfaces/Appender.md)

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:151

Get the wrapped appender

#### Returns

[`Appender`](../interfaces/Appender.md)

***

### getLayout()

> **getLayout**(): [`Layout`](../interfaces/Layout.md)

Defined in: packages/blue-logger/src/otel/exporters/appender-exporter.ts:158

Get the layout being used

#### Returns

[`Layout`](../interfaces/Layout.md)
