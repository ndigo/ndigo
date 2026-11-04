[**@ndigo/flags v0.0.1**](../README.md)

***

[@ndigo/flags](../README.md) / PropertyFlagProviderOptions

# Interface: PropertyFlagProviderOptions

Options for [PropertyFlagProvider](../classes/PropertyFlagProvider.md).

## Properties

### getProperty

> **getProperty**: (`key`) => `unknown`

The property reader (typically a `ConfigurableEnvironment`).

#### Parameters

##### key

`string`

#### Returns

`unknown`

***

### namespace?

> `optional` **namespace?**: `string`

Property namespace flags resolve under — default `'feature'`, so
flag `checkout` reads `feature.checkout`.
