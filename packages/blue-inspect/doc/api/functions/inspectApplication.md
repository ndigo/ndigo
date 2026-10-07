[**@blue/inspect v0.0.1**](../README.md)

***

[@blue/inspect](../README.md) / inspectApplication

# Function: inspectApplication()

> **inspectApplication**(`input`): [`InspectManifest`](../interfaces/InspectManifest.md)

Build a deterministic, versioned manifest from an application context.

Every collection is sorted and de-duplicated, so two runs over the same
application produce identical output apart from `generatedAt` (pin it with
`input.now` for byte-identical results). Configuration values are never
read — only key presence and origin — so secrets cannot leak.

## Parameters

### input

[`InspectInput`](../interfaces/InspectInput.md)

The context plus optional route/mapping/config sources.

## Returns

[`InspectManifest`](../interfaces/InspectManifest.md)

The application manifest.
