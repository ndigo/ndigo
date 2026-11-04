[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / defaultValue

# Function: defaultValue()

> **defaultValue**(`rawDefault`): (`value`, `context`) => `undefined`

Supplies the fallback value for a `@property` field when the property is
missing. The default is a raw string, converted through the same
ConversionService path as real property values (AD-15 D2).

## Parameters

### rawDefault

`string`

The default value (string; converted to the field type).

## Returns

A field decorator.

(`value`, `context`) => `undefined`

## Example

```ts
@configurationProperties('server')
class ServerConfig {
    @property('port') @defaultValue('8080') port!: number;
}
```
