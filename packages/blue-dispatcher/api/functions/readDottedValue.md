[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / readDottedValue

# Function: readDottedValue()

> **readDottedValue**(`source`, `key`): `unknown`

Reads a value from a record by exact key or dotted keypath.

## Parameters

### source

`Record`\<`string`, `unknown`\> \| `undefined`

The record to read from, or `undefined`.

### key

`string`

The flat or dotted key (`'email'`, `'address.city'`).

## Returns

`unknown`

The value at the key, or `undefined` when the key is absent or
  the walk leaves the object graph.
