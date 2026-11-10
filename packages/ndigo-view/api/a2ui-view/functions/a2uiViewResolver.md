[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [a2ui-view](../README.md) / a2uiViewResolver

# Function: a2uiViewResolver()

> **a2uiViewResolver**(`viewName?`): [`ViewResolver`](../../view-resolver/interfaces/ViewResolver.md)

Builds a resolver that serves [A2UIView](../classes/A2UIView.md) for one logical view name,
so content negotiation can pick A2UI against other representations.

## Parameters

### viewName?

`string` = `'a2ui'`

The logical view name (default `a2ui`).

## Returns

[`ViewResolver`](../../view-resolver/interfaces/ViewResolver.md)

A resolver for that name.

## Example

```ts
resolver.viewResolvers = [a2uiViewResolver(), staticResolver(new JSONView())];
```
