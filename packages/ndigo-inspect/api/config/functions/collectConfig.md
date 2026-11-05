[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [config](../README.md) / collectConfig

# Function: collectConfig()

> **collectConfig**(`classes`, `environment?`): [`InspectConfigEntry`](../../types/interfaces/InspectConfigEntry.md)[]

Enumerate the configuration keys the given classes declare.

Values are never read or decrypted: `hasValue` comes from presence-only
probing (`hasProperty`, never `getProperty`) and `origin` from the winning
source name, so secrets in the environment cannot leak into the manifest and
a wired decryptor is never consulted. Keys are de-duplicated (first class
wins) and sorted by key.

## Parameters

### classes

readonly `Function`[]

The `@configurationProperties` classes to enumerate.

### environment?

`Environment`

The environment to probe for presence, when available.

## Returns

[`InspectConfigEntry`](../../types/interfaces/InspectConfigEntry.md)[]

The sorted, value-free configuration entries.
