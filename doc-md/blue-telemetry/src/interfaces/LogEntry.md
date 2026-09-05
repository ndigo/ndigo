[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / LogEntry

# Interface: LogEntry

Defined in: [packages/blue-telemetry/src/logger/entry.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-11)

Represents a single log entry with structured information.
This interface defines the common properties expected for a log record,
including severity, message body, attributes, and optional OpenTelemetry trace context.

## Properties

### name

> **name**: `string`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-15)

The name of the logger that emitted this entry.

***

### severityNumber

> **severityNumber**: `SeverityNumber`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-19)

The numerical representation of the log entry's severity.

***

### severityText

> **severityText**: `string`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-23)

The textual representation of the log entry's severity (e.g., "INFO", "ERROR").

***

### body

> **body**: `string`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-27)

The main message body of the log entry.

***

### attributes?

> `optional` **attributes?**: `Attributes`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-31)

Optional. Additional attributes providing context for the log entry.

***

### timestamp?

> `optional` **timestamp?**: `number`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-36)

Optional. The Unix timestamp (in milliseconds) when the log entry was created.
If not provided, the current time will be used by the logging system.

***

### error?

> `optional` **error?**: `Exception`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-40)

Optional. An `Exception` object associated with the log entry, if applicable.

***

### traceId?

> `optional` **traceId?**: `string`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-44)

Optional. The OpenTelemetry trace ID associated with the log entry.

***

### spanId?

> `optional` **spanId?**: `string`

Defined in: [packages/blue-telemetry/src/logger/entry.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-48)

Optional. The OpenTelemetry span ID associated with the log entry.

***

### severityScheme?

> `optional` **severityScheme?**: [`SeverityScheme`](../type-aliases/SeverityScheme.md)

Defined in: [packages/blue-telemetry/src/logger/entry.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/logger/entry.ts#lines-52)

Optional. The severity scheme used to interpret `severityNumber` and `severityText`.
