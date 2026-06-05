[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / bodyValue

# Function: bodyValue()

> **bodyValue**(`name`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:441

Factory function: Create a request-body parameter extractor.
Use `name: '*'` to bind the entire parsed body object.

## Parameters

### name

`string`

### options?

#### required?

`boolean`

#### defaultValue?

`any`

#### convert?

[`ParameterValueConverterReference`](../type-aliases/ParameterValueConverterReference.md)

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
@routeParams({
  user: bodyValue('user'),
  payload: bodyValue('*')
})
```
