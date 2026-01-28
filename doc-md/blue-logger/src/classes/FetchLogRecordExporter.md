[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / FetchLogRecordExporter

# Class: FetchLogRecordExporter

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:53

FetchLogRecordExporter exports log records to an HTTP endpoint using the Fetch API.

This is the OTel-native replacement for FetchAppender, with support for
blue-logger's Layout system for backward compatibility.

## Example

```typescript
import { FetchLogRecordExporter, JSONLayout } from '@blue/logger';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

const exporter = new FetchLogRecordExporter('https://logs.example.com/api/logs', {
  layout: new JSONLayout(),
  timeout: 10000
});

const processor = new BatchLogRecordProcessor(exporter);
```

## Implements

- `LogRecordExporter`

## Constructors

### Constructor

> **new FetchLogRecordExporter**(`url`, `options`): `FetchLogRecordExporter`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:59

#### Parameters

##### url

`string`

##### options

[`FetchExporterOptions`](../interfaces/FetchExporterOptions.md) = `{}`

#### Returns

`FetchLogRecordExporter`

## Properties

### url

> `readonly` **url**: `string`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:54

***

### options

> `readonly` **options**: [`FetchExporterOptions`](../interfaces/FetchExporterOptions.md)

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:55

## Methods

### export()

> **export**(`logs`, `resultCallback`): `void`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:75

Export log records to HTTP endpoint

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

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:158

Shutdown the exporter

#### Returns

`Promise`\<`void`\>

#### Implementation of

`LogRecordExporter.shutdown`

***

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:172

Force flush any pending records

#### Returns

`Promise`\<`void`\>

***

### getLayout()

> **getLayout**(): [`BatchLayout`](../interfaces/BatchLayout.md)

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:182

Get the layout being used

#### Returns

[`BatchLayout`](../interfaces/BatchLayout.md)

***

### setLayout()

> **setLayout**(`layout`): `void`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:189

Set a new layout

#### Parameters

##### layout

[`BatchLayout`](../interfaces/BatchLayout.md)

#### Returns

`void`

***

### getUrl()

> **getUrl**(): `string`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:196

Get the target URL

#### Returns

`string`

***

### getOptions()

> **getOptions**(): [`FetchExporterOptions`](../interfaces/FetchExporterOptions.md)

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:203

Get the request options

#### Returns

[`FetchExporterOptions`](../interfaces/FetchExporterOptions.md)
