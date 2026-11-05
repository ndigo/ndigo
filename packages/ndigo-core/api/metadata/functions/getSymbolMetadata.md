[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [metadata](../README.md) / getSymbolMetadata

# Function: getSymbolMetadata()

> **getSymbolMetadata**(`target`): `Record`\<`string`, `any`\>

Reads the TC39 `Symbol.metadata` record a class carries (the carrier set up
by `@tsmetadata/polyfill`), accepting either the class or an instance — an
instance is unwrapped through its constructor. Targets that never received
metadata yield an empty record rather than throwing, so callers can read a
missing key without a guard.

## Parameters

### target

`unknown`

## Returns

`Record`\<`string`, `any`\>
