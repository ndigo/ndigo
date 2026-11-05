[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [configuration](../README.md) / propertySource

# Function: propertySource()

> **propertySource**(`source`): \<`T`\>(`target`, `context`) => `T`

Adds a property source to a configuration class.

## Parameters

### source

`JSONObject` \| `Enumerable`\<`string`, `JSONValue`\>

The source object or enumerable of key/value pairs.

## Returns

A class decorator that prepends the source to metadata.

\<`T`\>(`target`, `context`) => `T`
