[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / dataBinderValue

# Function: dataBinderValue()

> **dataBinderValue**(`source`, `target?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a whole-source data-binding parameter extractor.
Binds an entire flat source (e.g. `body`, `query`) into one nested object
via `DataBinder`, optionally filtering by prefix. Dotted client keys
(`address.street`) nest; repeated keys bind as arrays.

The optional target constructor makes the bound result a real instance of
the target instead of a plain object (mirrors `@file()`'s explicit-marker
convention, AD-26 D-5).

## Parameters

### source

[`DataBindingSource`](../../parameter-types/type-aliases/DataBindingSource.md)

The data source name.

### target?

new () => `object`

Optional target constructor for the bound result.

### options?

Required/default/prefix/conversion options.

#### convertType?

\{ `source`: `unknown`; `target`: `unknown`; \}

#### convertType.source

`unknown`

#### convertType.target

`unknown`

#### defaultValue?

`string`

#### prefix?

`string`

#### required?

`boolean`

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

## Example

```ts
parameters({
  user: dataBinderValue('body'),
  profile: dataBinderValue('body', ProfileForm, { prefix: 'profile.' })
})
```
