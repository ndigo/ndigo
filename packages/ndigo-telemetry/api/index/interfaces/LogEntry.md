[**@ndigo/telemetry v0.0.1**](../../README.md)

***

[@ndigo/telemetry](../../README.md) / [index](../README.md) / LogEntry

# Interface: LogEntry

Represents a single log entry with structured information.
This interface defines the common properties expected for a log record,
including severity, message body, attributes, and optional OpenTelemetry trace context.

## Properties

### attributes?

> `optional` **attributes?**: `Attributes`

Optional. Additional attributes providing context for the log entry.

***

### body

> **body**: `string`

The main message body of the log entry.

***

### error?

> `optional` **error?**: `Exception`

Optional. An `Exception` object associated with the log entry, if applicable.

***

### name

> **name**: `string`

The name of the logger that emitted this entry.

***

### severityNumber

> **severityNumber**: `SeverityNumber`

The numerical representation of the log entry's severity.

***

### severityScheme?

> `optional` **severityScheme?**: [`SeverityScheme`](../type-aliases/SeverityScheme.md)

Optional. The severity scheme used to interpret `severityNumber` and `severityText`.

***

### severityText

> **severityText**: `string`

The textual representation of the log entry's severity (e.g., "INFO", "ERROR").

***

### spanId?

> `optional` **spanId?**: `string`

Optional. The OpenTelemetry span ID associated with the log entry.

***

### timestamp?

> `optional` **timestamp?**: `number`

Optional. The Unix timestamp (in milliseconds) when the log entry was created.
If not provided, the current time will be used by the logging system.

***

### traceId?

> `optional` **traceId?**: `string`

Optional. The OpenTelemetry trace ID associated with the log entry.
