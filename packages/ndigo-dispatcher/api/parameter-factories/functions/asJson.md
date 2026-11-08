[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / asJson

# Function: asJson()

> **asJson**\<`_T`\>(`extractor`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce JSON conversion.

## Type Parameters

### _T

`_T` = `unknown`

## Parameters

### extractor

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The extractor to wrap.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The extractor with JSON conversion.

## Example

```ts
asJson<UserProfile>(sessionStorageValue('profile'))
```
