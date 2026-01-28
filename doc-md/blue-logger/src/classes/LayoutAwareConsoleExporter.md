[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / LayoutAwareConsoleExporter

# Class: LayoutAwareConsoleExporter

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:48

LayoutAwareConsoleExporter exports log records to the browser/Node.js console
with support for blue-logger Layout formatting.

## Example

```typescript
import { LayoutAwareConsoleExporter, PatternLayout } from '@blue/logger';

const exporter = new LayoutAwareConsoleExporter({
  layout: new PatternLayout('[%d] %c %p - %m')
});
```

## Implements

- `LogRecordExporter`

## Constructors

### Constructor

> **new LayoutAwareConsoleExporter**(`options`): `LayoutAwareConsoleExporter`

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:53

#### Parameters

##### options

[`ConsoleExporterOptions`](../interfaces/ConsoleExporterOptions.md) = `{}`

#### Returns

`LayoutAwareConsoleExporter`

## Methods

### export()

> **export**(`logs`, `resultCallback`): `void`

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:65

Export log records to console

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

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:123

Shutdown the exporter

#### Returns

`Promise`\<`void`\>

#### Implementation of

`LogRecordExporter.shutdown`

***

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:130

Force flush any pending records

#### Returns

`Promise`\<`void`\>

***

### getLayout()

> **getLayout**(): [`Layout`](../interfaces/Layout.md)

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:137

Get the layout being used

#### Returns

[`Layout`](../interfaces/Layout.md)

***

### setLayout()

> **setLayout**(`layout`): `void`

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:144

Set a new layout

#### Parameters

##### layout

[`Layout`](../interfaces/Layout.md)

#### Returns

`void`
