[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / wrapSource

# Function: wrapSource()

> **wrapSource**(`name`, `source`): [`PropertySource`](../interfaces/PropertySource.md)

Creates a [PropertySource](../interfaces/PropertySource.md) that captures the given object.

The object is copied into a null-prototype plain object, so registration is
immune to later caller mutation and to `__proto__`-named keys becoming
prototype pollution. Sources are replaced, not mutated.

## Parameters

### name

`string`

The stable source name (used as an anchor for reordering).

### source

`JSONObject`

The property values to capture.

## Returns

[`PropertySource`](../interfaces/PropertySource.md)

The captured property source.
