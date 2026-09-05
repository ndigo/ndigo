[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / SeverityMapping

# Interface: SeverityMapping

Defined in: [packages/blue-telemetry/src/severity/severity-mapping.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/severity/severity-mapping.ts#lines-18)

Defines an interface for mapping between string-based log level names and OpenTelemetry `SeverityNumber`s.

Implementations of this interface provide a way to standardize log severity across different
logging schemes (e.g., syslog, npm, Apache).

## Properties

### scheme

> `readonly` **scheme**: [`SeverityScheme`](../type-aliases/SeverityScheme.md)

Defined in: [packages/blue-telemetry/src/severity/severity-mapping.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/severity/severity-mapping.ts#lines-22)

The name of the severity scheme this mapping implements.

## Methods

### toSeverityNumber()

> **toSeverityNumber**(`levelName`): `SeverityNumber`

Defined in: [packages/blue-telemetry/src/severity/severity-mapping.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/severity/severity-mapping.ts#lines-29)

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

Defined in: [packages/blue-telemetry/src/severity/severity-mapping.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/severity/severity-mapping.ts#lines-36)

Converts an OpenTelemetry `SeverityNumber` to its corresponding string-based log level name.

#### Parameters

##### severityNumber

`SeverityNumber`

The `SeverityNumber` to convert.

#### Returns

`string`

The string name of the log level.
