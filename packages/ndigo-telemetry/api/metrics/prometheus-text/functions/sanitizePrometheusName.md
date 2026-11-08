[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/prometheus-text](../README.md) / sanitizePrometheusName

# Function: sanitizePrometheusName()

> **sanitizePrometheusName**(`name`): `string`

Sanitizes an OTel instrument name to the Prometheus name grammar
`[a-zA-Z_:][a-zA-Z0-9_:.]*`: every invalid character becomes `_`, and a
leading digit gains an `_` prefix (a name may not start with a digit).

## Parameters

### name

`string`

The instrument or attribute name.

## Returns

`string`

The Prometheus-safe name.
