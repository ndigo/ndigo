[**@ndigo/view-toon v0.0.1**](../../README.md)

***

[@ndigo/view-toon](../../README.md) / [toon-view-resolver](../README.md) / toonViewResolver

# Function: toonViewResolver()

> **toonViewResolver**(`viewName?`, `options?`): `ViewResolver`

Builds a resolver that serves [ToonView](../../toon-view/classes/ToonView.md) for one logical view name.

## Parameters

### viewName?

`string` = `'toon'`

The logical view name (default `toon`).

### options?

[`ToonEncodeOptions`](../../toon-encode/interfaces/ToonEncodeOptions.md) = `{}`

TOON encoding options for the produced views.

## Returns

`ViewResolver`

A resolver for that name.

## Example

```ts
resolver.viewResolvers = [toonViewResolver('report'), {
    resolveViewName: async () => new JSONView(),
}];
// Accept: text/toon → ToonView; an unopinionated client gets JSON.
```
