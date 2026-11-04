[**@ndigo/test v0.0.1**](../README.md)

***

[@ndigo/test](../README.md) / BrowserMockClient

# Class: BrowserMockClient

Socket-free mock MVC client for browser applications. Dispatches routes
through the real `BrowserDispatcher` and captures the rendered view.

## Constructors

### Constructor

> **new BrowserMockClient**(`app`): `BrowserMockClient`

#### Parameters

##### app

[`BrowserTestApp`](../interfaces/BrowserTestApp.md)

A booted browser app.

#### Returns

`BrowserMockClient`

## Accessors

### lastRender

#### Get Signature

> **get** **lastRender**(): [`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

The captured render from the last dispatch.

##### Returns

[`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

## Methods

### dispatch()

> **dispatch**(`path`): `Promise`\<[`CapturedRender`](../interfaces/CapturedRender.md)\>

Dispatches a route through the browser pipeline.

#### Parameters

##### path

`string`

The route path, e.g. `/account/settings`.

#### Returns

`Promise`\<[`CapturedRender`](../interfaces/CapturedRender.md)\>

The captured render (output element + model).
