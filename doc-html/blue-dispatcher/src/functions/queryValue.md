[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / queryValue

# Function: queryValue()

> **queryValue**(`name`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:178](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-178)

Factory function: Create a query parameter extractor

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
  page: queryValue('page'),
  limit: queryValue('limit', { required: true, defaultValue: '10' })
})
```
