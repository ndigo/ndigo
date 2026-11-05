[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [configuration-properties](../README.md) / ConfigurationPropertiesResult

# Interface: ConfigurationPropertiesResult\<T\>

Result of resolving a configuration properties class against an application context.

## Type Parameters

### T

`T`

## Properties

### bindings

> **bindings**: `Record`\<`string`, `JSONValue` \| `undefined`\>

Bound paths and their resolved values. Never contains decrypted secret
plaintext: a scalar binding whose raw source value was a `{cipher:…}`
marker holds `REDACTED_VALUE` instead of the plaintext. A nested
`@nestedConfig` field records the bound sub-object by its top-level key.

***

### instance

> **instance**: `T`

The resolved instance with bound property values.

***

### isValid

> **isValid**: `boolean`

Whether all properties resolved successfully (always true — binders throw on failure).
