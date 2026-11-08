[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / asDate

# Function: asDate()

> **asDate**(`extractor`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce Date conversion.

## Parameters

### extractor

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The extractor to wrap.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The extractor with Date conversion.

## Example

```ts
asDate(cookieValue('lastLogin'))
```
