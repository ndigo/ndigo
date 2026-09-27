[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / resolveCachedSpec

# Function: resolveCachedSpec()

> **resolveCachedSpec**(`spec?`): [`NormalizedCachedSpec`](../interfaces/NormalizedCachedSpec.md)

Normalizes and validates a [CachedSpec](../interfaces/CachedSpec.md). Throws at decoration time
for malformed specs — in any environment importing the module (the browser
included), mirroring `resolveScheduledSpec` (AD-20 D5.2).

## Parameters

### spec?

[`CachedSpec`](../interfaces/CachedSpec.md) = `{}`

The supplied spec.

## Returns

[`NormalizedCachedSpec`](../interfaces/NormalizedCachedSpec.md)

The normalized spec record.
