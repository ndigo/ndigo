[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/prometheus-text](../README.md) / renderPrometheusAttributes

# Function: renderPrometheusAttributes()

> **renderPrometheusAttributes**(`attributes`): `string`

Renders the attribute set as `{k="v",...}` in sorted key order. Only
scalar values render; empty sets render as `{}`. Keys pass through
[sanitizePrometheusName](sanitizePrometheusName.md) — an attribute key outside the exposition
grammar would otherwise produce a malformed document (REV-004) — and a
sanitized collision within one set keeps the first key.

## Parameters

### attributes

`Readonly`\<`Record`\<`string`, `AttributeValue`\>\>

The point's attribute set.

## Returns

`string`

The rendered `{k="v",...}` attribute block.
