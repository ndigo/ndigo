[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / bindValue

# Function: bindValue()

> **bindValue**(`source`, `options?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Defined in: packages/blue-dispatcher/src/route-parameter.ts:369

Factory function: Create a binding parameter extractor.
Binds an entire source (e.g. query, state) to an object, optionally filtering by prefix.

## Parameters

### source

`"path"` \| `"query"` \| `"state"` \| `"session"` \| `"model"` \| `"cookie"` \| `"matrix"`

### options?

#### required?

`boolean`

#### defaultValue?

`any`

#### convert?

[`ParameterValueConverterReference`](../type-aliases/ParameterValueConverterReference.md)

#### prefix?

`string`

## Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

## Example

```ts
@routeParams({
  user: bindValue('query', { prefix: 'user.' })
})
```
