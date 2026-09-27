[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / asDate

# Function: asDate()

> **asDate**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Wraps a parameter extractor to enforce Date conversion.

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asDate(cookieValue('lastLogin'))
```
