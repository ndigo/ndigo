[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / withConversion

# Function: withConversion()

> **withConversion**(`extractor`, `convertType`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:436](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-436)

Wraps a parameter extractor to enforce type-based conversion via ConversionService.

## Parameters

### extractor

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

### convertType

#### source

`any`

#### target

`any`

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
withConversion(queryValue('id'), { source: String, target: UUID })
```
