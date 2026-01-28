[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / OTelLogger

# Class: OTelLogger

Defined in: packages/blue-logger/src/otel/otel-logger.ts:28

OTelLogger is a blue-logger Logger implementation backed by OpenTelemetry.

This class bridges the blue-logger interface with OTel's logging API,
converting Entries to LogRecords and emitting them through the OTel pipeline.

## Example

```typescript
import { BlueLoggerProvider } from '@blue/logger';

const provider = new BlueLoggerProvider();
const logger = provider.createLogger('my-app');

logger.log(Level.INFO, ['Application started']);
```

## Extends

- [`AbstractLogger`](AbstractLogger.md)

## Extended by

- [`ContextAwareLogger`](ContextAwareLogger.md)

## Constructors

### Constructor

> **new OTelLogger**(`name`, `otelLogger`, `options`): `OTelLogger`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:40

Create an OTelLogger

#### Parameters

##### name

`string`

Logger name

##### otelLogger

`Logger`

OpenTelemetry Logger instance

##### options

`Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\> = `{}`

Optional conversion options

#### Returns

`OTelLogger`

#### Overrides

[`AbstractLogger`](AbstractLogger.md).[`constructor`](AbstractLogger.md#constructor)

## Properties

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`compare`](AbstractLogger.md#compare)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/logger.ts:31

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`name`](AbstractLogger.md#name)

***

### threshold

> **threshold**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/logger.ts:32

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`threshold`](AbstractLogger.md#threshold)

***

### otelLogger

> `protected` **otelLogger**: `Logger`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:29

***

### scheme

> `protected` **scheme**: `"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:30

***

### conversionOptions

> `protected` **conversionOptions**: `Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Defined in: packages/blue-logger/src/otel/otel-logger.ts:31

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-logger/src/logger.ts:34

##### Returns

`string`

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`[toStringTag]`](AbstractLogger.md#tostringtag)

## Methods

### log()

> **log**(`level`, `message`): `void`

Defined in: packages/blue-logger/src/logger.ts:49

#### Parameters

##### level

[`Level`](Level.md)

##### message

[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`void`

#### Inherited from

[`AbstractLogger`](AbstractLogger.md).[`log`](AbstractLogger.md#log)

***

### \_logEntry()

> `protected` **\_logEntry**(`entry`): `void`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:52

Log an entry by converting it to a LogRecord and emitting via OTel

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

The Entry to log

#### Returns

`void`

#### Overrides

[`AbstractLogger`](AbstractLogger.md).[`_logEntry`](AbstractLogger.md#_logentry)

***

### getOTelLogger()

> **getOTelLogger**(): `Logger`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:71

Get the underlying OpenTelemetry Logger

#### Returns

`Logger`

The OTel Logger instance

***

### setScheme()

> **setScheme**(`scheme`): `void`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:80

Set the level scheme for severity mapping

#### Parameters

##### scheme

The level scheme to use

`"apache"` | `"npm"` | `"cli"` | `"syslog"`

#### Returns

`void`

***

### getScheme()

> **getScheme**(): `"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:89

Get the current level scheme

#### Returns

`"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

The current level scheme

***

### setConversionOptions()

> **setConversionOptions**(`options`): `void`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:98

Set conversion options for Entry to LogRecord conversion

#### Parameters

##### options

`Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Conversion options

#### Returns

`void`

***

### getConversionOptions()

> **getConversionOptions**(): `Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Defined in: packages/blue-logger/src/otel/otel-logger.ts:107

Get current conversion options

#### Returns

`Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Current conversion options
