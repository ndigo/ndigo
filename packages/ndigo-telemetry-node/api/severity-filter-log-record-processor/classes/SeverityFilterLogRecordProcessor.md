[**@ndigo/telemetry-node v0.0.1**](../../README.md)

***

[@ndigo/telemetry-node](../../README.md) / [severity-filter-log-record-processor](../README.md) / SeverityFilterLogRecordProcessor

# Class: SeverityFilterLogRecordProcessor

A `LogRecordProcessor` that filters log records based on their severity number.

This processor wraps another `LogRecordProcessor` and only passes log records
to the delegate if their severity number meets or exceeds a configured minimum severity.

## Implements

- `LogRecordProcessor`

## Constructors

### Constructor

> **new SeverityFilterLogRecordProcessor**(`delegate`, `minimumSeverity?`): `SeverityFilterLogRecordProcessor`

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

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Forces the flushing of any buffered log records by delegating to the wrapped processor.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the flush operation is complete.

#### Implementation of

`LogRecordProcessor.forceFlush`

***

### onEmit()

> **onEmit**(`logRecord`, `context?`): `void`

Processes a `LogRecord`. If the log record's severity meets the minimum threshold,
it is passed to the delegate processor. Otherwise, it is dropped.

#### Parameters

##### logRecord

`ReadWriteLogRecord`

The `ReadWriteLogRecord` to process.

##### context?

`Context`

Optional. The OpenTelemetry `Context` associated with the log record.

#### Returns

`void`

#### Implementation of

`LogRecordProcessor.onEmit`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Shuts down the processor by delegating to the wrapped processor.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the shutdown operation is complete.

#### Implementation of

`LogRecordProcessor.shutdown`
