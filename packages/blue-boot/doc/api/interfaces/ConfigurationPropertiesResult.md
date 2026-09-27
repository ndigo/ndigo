[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / ConfigurationPropertiesResult

# Interface: ConfigurationPropertiesResult\<T\>

Result of resolving a configuration properties class against an application context.

## Type Parameters

### T

`T`

## Properties

### bindings

> **bindings**: `Record`\<`string`, `JSONValue` \| `undefined`\>

Bound paths and their resolved values.

***

### instance

> **instance**: `T`

The resolved instance with bound property values.

***

### isValid

> **isValid**: `boolean`

Whether all properties resolved successfully (always true — binders throw on failure).
