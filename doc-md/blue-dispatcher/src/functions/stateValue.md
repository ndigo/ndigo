[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / stateValue

# Function: stateValue()

> **stateValue**(`name`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:289](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-289)

Factory function: Create a history state parameter extractor

## Parameters

### name

`string`

### options?

[`ParameterExtractorOptions`](../interfaces/ParameterExtractorOptions.md) = `{}`

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
`routeParams`({
  token: stateValue('token'),
})
```
