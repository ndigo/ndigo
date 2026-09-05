[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry-node/src](../README.md) / SeverityFilterLogRecordProcessor

# Class: SeverityFilterLogRecordProcessor

Defined in: [packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts#lines-11)

A `LogRecordProcessor` that filters log records based on their severity number.

This processor wraps another `LogRecordProcessor` and only passes log records
to the delegate if their severity number meets or exceeds a configured minimum severity.

## Implements

- `LogRecordProcessor`

## Constructors

### Constructor

> **new SeverityFilterLogRecordProcessor**(`delegate`, `minimumSeverity?`): `SeverityFilterLogRecordProcessor`

Defined in: [packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts#lines-21)

Creates an instance of `SeverityFilterLogRecordProcessor`.

#### Parameters

##### delegate

`LogRecordProcessor`

The underlying `LogRecordProcessor` to which filtered log records will be passed.

##### minimumSeverity?

`SeverityNumber` = `SeverityNumber.UNSPECIFIED`

The minimum `SeverityNumber` required for a log record to be processed.
                         Defaults to `SeverityNumber.UNSPECIFIED`, meaning all records are processed.

#### Returns

`SeverityFilterLogRecordProcessor`

## Methods

### onEmit()

> **onEmit**(`logRecord`, `context?`): `void`

Defined in: [packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts#lines-32)

Processes a `LogRecord`. If the log record's severity meets the minimum threshold,
it is passed to the delegate processor. Otherwise, it is dropped.

#### Parameters

##### logRecord

`ReadWriteLogRecord`

The `SdkLogRecord` to process.

##### context?

`Context`

Optional. The OpenTelemetry `Context` associated with the log record.

#### Returns

`void`

#### Implementation of

`LogRecordProcessor.onEmit`

***

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Defined in: [packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts#lines-44)

Forces the flushing of any buffered log records by delegating to the wrapped processor.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the flush operation is complete.

#### Implementation of

`LogRecordProcessor.forceFlush`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/severity-filter-log-record-processor.ts#lines-52)

Shuts down the processor by delegating to the wrapped processor.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the shutdown operation is complete.

#### Implementation of

`LogRecordProcessor.shutdown`
