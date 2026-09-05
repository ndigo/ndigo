[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / EntryToLogRecordOptions

# Interface: EntryToLogRecordOptions

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:16

Options for converting Entry to LogRecord

## Properties

### context?

> `optional` **context**: `Context`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:21

OpenTelemetry context to associate with the log record
If not provided, uses the active context

---

### scheme?

> `optional` **scheme**: `"apache"` \| `"npm"` \| `"cli"` \| `"syslog"`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:26

Level scheme to use for severity mapping

---

### attributes?

> `optional` **attributes**: `AnyValueMap`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:31

Additional attributes to include in the log record

---

### resource?

> `optional` **resource**: `any`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:36

Resource to associate with the log record

---

### instrumentationScope?

> `optional` **instrumentationScope**: `object`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:41

Instrumentation scope

#### name

> **name**: `string`

#### version?

> `optional` **version**: `string`

#### schemaUrl?

> `optional` **schemaUrl**: `string`
