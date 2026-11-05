[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / pathValue

# Function: pathValue()

> **pathValue**(): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Binder for the entire matched path string — `pathValue()` binds the
request/socket path (e.g. `/abc/42`) as a value, distinct from
`pathVariable` which extracts a single inferred segment (`:id` → `42`).
Available on route, request, and socket mappings.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

A full-path extractor.
