[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / stateValue

# Function: stateValue()

> **stateValue**(`name`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:347

Factory function: Create a history state parameter extractor

## Parameters

### name

`string`

### options?

#### required?

`boolean`

#### defaultValue?

`string`

#### convert?

[`ParameterValueConverterReference`](../type-aliases/ParameterValueConverterReference.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
@routeParams({
  token: stateValue('token'),
})
```
