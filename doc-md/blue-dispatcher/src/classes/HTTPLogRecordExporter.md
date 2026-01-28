[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / HTTPLogRecordExporter

# Class: HTTPLogRecordExporter

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:50

HTTPLogRecordExporter is an OpenTelemetry LogRecordExporter that sends log records
to an HTTP endpoint using blue-dispatcher's HTTP service with dependency injection.

This is the OTel-native replacement for HTTPAppender, preserving the dependency
injection pattern and Layout formatting system.

## Example

```typescript
import { HTTPLogRecordExporter } from '@blue/dispatcher';
import { BlueLoggerProvider, BatchLogRecordProcessor, JSONLayout } from '@blue/logger';

const exporter = new HTTPLogRecordExporter('/api/logs', {
  timeout: 10000
});
exporter.setLayout(new JSONLayout());

const processor = new BatchLogRecordProcessor(exporter);
const provider = new BlueLoggerProvider({ processors: [processor] });
```

## Implements

- `LogRecordExporter`
- [`HTTPAware`](../../../blue-http/src/interfaces/HTTPAware.md)

## Constructors

### Constructor

> **new HTTPLogRecordExporter**(`url`, `init`): `HTTPLogRecordExporter`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:61

#### Parameters

##### url

`string`

##### init

[`TimeoutInit`](../../../blue-http/src/type-aliases/TimeoutInit.md) = `{}`

#### Returns

`HTTPLogRecordExporter`

## Properties

### url

> `readonly` **url**: `string`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:52

***

### settings

> `readonly` **settings**: [`TimeoutInit`](../../../blue-http/src/type-aliases/TimeoutInit.md)

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:53

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:57

##### Returns

`boolean`

#### Implementation of

[`HTTPAware`](../../../blue-http/src/interfaces/HTTPAware.md).[`[$aware]`](../../../blue-http/src/interfaces/HTTPAware.md#aware)

## Methods

### export()

> **export**(`logs`, `resultCallback`): `void`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:73

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

### setHTTP()

> **setHTTP**(`http`): `void`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:176

Set the HTTP service (dependency injection)

#### Parameters

##### http

[`HTTP`](../../../blue-http/src/classes/HTTP.md)

The HTTP service to use for requests

#### Returns

`void`

#### Implementation of

[`HTTPAware`](../../../blue-http/src/interfaces/HTTPAware.md).[`setHTTP`](../../../blue-http/src/interfaces/HTTPAware.md#sethttp)

***

### getHTTP()

> **getHTTP**(): [`HTTP`](../../../blue-http/src/classes/HTTP.md)

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:185

Get the HTTP service

#### Returns

[`HTTP`](../../../blue-http/src/classes/HTTP.md)

The injected HTTP service or undefined

***

### setLayout()

> **setLayout**(`layout`): `void`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:194

Set the layout for formatting log batches

#### Parameters

##### layout

[`BatchLayout`](../../../blue-logger/src/interfaces/BatchLayout.md)

The BatchLayout to use

#### Returns

`void`

***

### getLayout()

> **getLayout**(): [`BatchLayout`](../../../blue-logger/src/interfaces/BatchLayout.md)

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:203

Get the current layout

#### Returns

[`BatchLayout`](../../../blue-logger/src/interfaces/BatchLayout.md)

The current BatchLayout

***

### getUrl()

> **getUrl**(): `string`

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:212

Get the target URL

#### Returns

`string`

The HTTP endpoint URL

***

### getSettings()

> **getSettings**(): [`TimeoutInit`](../../../blue-http/src/type-aliases/TimeoutInit.md)

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:221

Get the request settings

#### Returns

[`TimeoutInit`](../../../blue-http/src/type-aliases/TimeoutInit.md)

Copy of the request settings

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:228

Shutdown the exporter

#### Returns

`Promise`\<`void`\>

#### Implementation of

`LogRecordExporter.shutdown`

***

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/logger/otel-http-exporter.ts:242

Force flush any pending records

#### Returns

`Promise`\<`void`\>
