[**@ndigo/telemetry-node v0.0.1**](../../README.md)

***

[@ndigo/telemetry-node](../../README.md) / [node-config](../README.md) / ResolvedExporter

# Type Alias: ResolvedExporter

> **ResolvedExporter** = \{ `kind`: `"console"`; \} \| \{ `kind`: `"none"`; \} \| \{ `headers?`: `Record`\<`string`, `string`\>; `kind`: `"otlp"`; `url?`: `string`; \} \| \{ `kind`: `"prometheus"`; \}

The resolved export choice for one signal.
