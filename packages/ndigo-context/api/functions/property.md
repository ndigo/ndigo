[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / property

# Function: property()

> **property**(`path`, `propertyType?`): (`value`, `context`) => `void`

Binds a class field to a property path resolved from the environment.

## Parameters

### path

`string`

The property path to resolve.

### propertyType?

`string` \| (new (...`args`) => `number`) \| (new (...`args`) => `boolean`) \| (new (...`args`) => `Date`) \| (new (...`args`) => `string`)

## Returns

A field decorator that captures the path in metadata.

(`value`, `context`) => `void`
