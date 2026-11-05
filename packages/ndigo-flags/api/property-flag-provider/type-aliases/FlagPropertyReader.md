[**@ndigo/flags v0.0.1**](../../README.md)

***

[@ndigo/flags](../../README.md) / [property-flag-provider](../README.md) / FlagPropertyReader

# Type Alias: FlagPropertyReader

> **FlagPropertyReader** = `object`

The property reader the provider evaluates against. The environment
satisfies this shape structurally (`getProperty(key)`), so the leaf
package never depends on `@ndigo/context`.

## Methods

### getProperty()

> **getProperty**(`key`): `unknown`

#### Parameters

##### key

`string`

#### Returns

`unknown`
