[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / asArray

# Function: asArray()

> **asArray**(`extractor`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:428](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-428)

Wraps a parameter extractor to enforce array conversion.

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
asArray(queryValue('tags'))
```
