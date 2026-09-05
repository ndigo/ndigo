[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / ContextAwareLogger

# Class: ContextAwareLogger

Defined in: packages/blue-logger/src/otel/context-logger.ts:36

ContextAwareLogger extends OTelLogger with automatic trace correlation.

This logger automatically injects trace_id, span_id, and trace_flags
from the active OpenTelemetry context into log records, enabling
correlation between logs and traces in observability systems.

## Example

```typescript
import { ContextAwareLogger, BlueLoggerProvider } from '@blue/logger';
import { trace } from '@opentelemetry/api';

const provider = new BlueLoggerProvider();
const otelLogger = provider.getLogger('my-app');
const logger = new ContextAwareLogger('my-app', otelLogger);

// Within a traced operation
const tracer = trace.getTracer('my-app');
const span = tracer.startSpan('operation');
trace.context.with(trace.setSpan(apiContext.active(), span), () => {
    logger.info('This log will include trace_id and span_id');
    span.end();
});
```

## Extends

- [`OTelLogger`](OTelLogger.md)

## Constructors

### Constructor

> **new ContextAwareLogger**(`name`, `otelLogger`, `options`, `autoInjectContext`): `ContextAwareLogger`

Defined in: packages/blue-logger/src/otel/context-logger.ts:47

Create a ContextAwareLogger

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

##### autoInjectContext

`boolean` = `true`

Whether to automatically inject context (default: true)

#### Returns

`ContextAwareLogger`

#### Overrides

[`OTelLogger`](OTelLogger.md).[`constructor`](OTelLogger.md#constructor)

## Properties

### compare

> **compare**: [`comparison`](../../../blue-core/src/type-aliases/comparison.md)\<[`Level`](Level.md)\>

Defined in: packages/blue-core/src/comparable.ts:20

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`compare`](OTelLogger.md#compare)

---

### name

> `readonly` **name**: `string`

Defined in: packages/blue-logger/src/logger.ts:31

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`name`](OTelLogger.md#name)

---

### threshold

> **threshold**: [`Level`](Level.md)

Defined in: packages/blue-logger/src/logger.ts:32

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`threshold`](OTelLogger.md#threshold)

---

### otelLogger

> `protected` **otelLogger**: `Logger`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:29

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`otelLogger`](OTelLogger.md#otellogger)

---

### scheme

> `protected` **scheme**: `"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:30

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`scheme`](OTelLogger.md#scheme)

---

### conversionOptions

> `protected` **conversionOptions**: `Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Defined in: packages/blue-logger/src/otel/otel-logger.ts:31

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`conversionOptions`](OTelLogger.md#conversionoptions)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-logger/src/logger.ts:34

##### Returns

`string`

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`[toStringTag]`](OTelLogger.md#tostringtag)

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

[`OTelLogger`](OTelLogger.md).[`log`](OTelLogger.md#log)

---

### \_logEntry()

> `protected` **\_logEntry**(`entry`): `void`

Defined in: packages/blue-logger/src/otel/context-logger.ts:62

Log an entry with automatic trace context injection

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

The Entry to log

#### Returns

`void`

#### Overrides

[`OTelLogger`](OTelLogger.md).[`_logEntry`](OTelLogger.md#_logentry)

---

### setAutoInjectContext()

> **setAutoInjectContext**(`enabled`): `void`

Defined in: packages/blue-logger/src/otel/context-logger.ts:88

Enable or disable automatic context injection

#### Parameters

##### enabled

`boolean`

Whether to enable auto-injection

#### Returns

`void`

---

### isAutoInjectContextEnabled()

> **isAutoInjectContextEnabled**(): `boolean`

Defined in: packages/blue-logger/src/otel/context-logger.ts:97

Check if automatic context injection is enabled

#### Returns

`boolean`

True if auto-injection is enabled

---

### getActiveTraceContext()

> **getActiveTraceContext**(): `object`

Defined in: packages/blue-logger/src/otel/context-logger.ts:106

Get the current active trace context

#### Returns

`object`

Trace context object or undefined

##### traceId?

> `optional` **traceId**: `string`

##### spanId?

> `optional` **spanId**: `string`

##### traceFlags?

> `optional` **traceFlags**: `number`

---

### getOTelLogger()

> **getOTelLogger**(): `Logger`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:71

Get the underlying OpenTelemetry Logger

#### Returns

`Logger`

The OTel Logger instance

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`getOTelLogger`](OTelLogger.md#getotellogger)

---

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

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`setScheme`](OTelLogger.md#setscheme)

---

### getScheme()

> **getScheme**(): `"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

Defined in: packages/blue-logger/src/otel/otel-logger.ts:89

Get the current level scheme

#### Returns

`"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

The current level scheme

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`getScheme`](OTelLogger.md#getscheme)

---

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

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`setConversionOptions`](OTelLogger.md#setconversionoptions)

---

### getConversionOptions()

> **getConversionOptions**(): `Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Defined in: packages/blue-logger/src/otel/otel-logger.ts:107

Get current conversion options

#### Returns

`Partial`\<[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md)\>

Current conversion options

#### Inherited from

[`OTelLogger`](OTelLogger.md).[`getConversionOptions`](OTelLogger.md#getconversionoptions)
