[**@blue/log v0.0.1**](../README.md)

***

[@blue/log](../README.md) / SeverityMapping

# Interface: SeverityMapping

Defines an interface for mapping between string-based log level names and OpenTelemetry `SeverityNumber`s.

Implementations of this interface provide a way to standardize log severity across different
logging schemes (e.g., syslog, npm, Apache).

## Properties

### scheme

> `readonly` **scheme**: [`SeverityScheme`](../type-aliases/SeverityScheme.md)

The name of the severity scheme this mapping implements.

## Methods

### toSeverityNumber()

> **toSeverityNumber**(`levelName`): `SeverityNumber`

Converts a string-based log level name to its corresponding OpenTelemetry `SeverityNumber`.

#### Parameters

##### levelName

`string`

The string name of the log level (e.g., "info", "error").

#### Returns

`SeverityNumber`

The `SeverityNumber` corresponding to the given level name.

***

### toSeverityText()

> **toSeverityText**(`severityNumber`): `string`

Converts an OpenTelemetry `SeverityNumber` to its corresponding string-based log level name.

#### Parameters

##### severityNumber

`SeverityNumber`

The `SeverityNumber` to convert.

#### Returns

`string`

The string name of the log level.
