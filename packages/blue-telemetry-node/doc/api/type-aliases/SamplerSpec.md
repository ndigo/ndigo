[**@blue/telemetry-node v0.0.1**](../README.md)

***

[@blue/telemetry-node](../README.md) / SamplerSpec

# Type Alias: SamplerSpec

> **SamplerSpec** = \{ `ratio`: `number`; \} \| `"always"` \| `"off"` \| `Sampler`

Trace sampling configuration (AD-32 D-1). Presets resolve to parent-based
samplers so child spans inherit the root decision; a raw OTel `Sampler`
passes through untouched. Default: `'always'` (100% sampling — today's
effective behavior).
