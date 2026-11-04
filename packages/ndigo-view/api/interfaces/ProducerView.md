[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / ProducerView

# Interface: ProducerView

A view that produces a complete response document rather than rendering
into a [ViewTarget](ViewTarget.md).

This is the server-side (document) rendering mode — the servlet/JSP-style
whole-page equivalent: an EJS page, a JSON API body, or a streamed
response. A producing view renders to any consumer (an HTTP response, a
capture target in tests) through the returned [RenderResult](RenderResult.md) and
never owns a destination.

## Methods

### renderTo()

> **renderTo**(`model`, `route`): `Promise`\<[`RenderResult`](RenderResult.md)\>

Renders the view to a complete response document.

#### Parameters

##### model

`unknown`

The data model supplied to the view.

##### route

[`Route`](#)

The current route.

#### Returns

`Promise`\<[`RenderResult`](RenderResult.md)\>

The response document.
