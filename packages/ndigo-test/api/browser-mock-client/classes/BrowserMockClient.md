[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [browser-mock-client](../README.md) / BrowserMockClient

# Class: BrowserMockClient

Socket-free mock MVC client for browser applications. Dispatches routes
through the real `BrowserDispatcher` and captures the rendered view.

## Constructors

### Constructor

> **new BrowserMockClient**(`app`): `BrowserMockClient`

Creates a client around a booted browser app.

#### Parameters

##### app

[`BrowserTestApp`](../interfaces/BrowserTestApp.md)

A booted browser app.

#### Returns

`BrowserMockClient`

## Accessors

### lastRender

#### Get Signature

> **get** **lastRender**(): [`CapturedRender`](../../memory-view-target/interfaces/CapturedRender.md) \| `null`

The captured render from the last dispatch.

##### Returns

[`CapturedRender`](../../memory-view-target/interfaces/CapturedRender.md) \| `null`

## Methods

### dispatch()

> **dispatch**(`path`): `Promise`\<[`CapturedRender`](../../memory-view-target/interfaces/CapturedRender.md)\>

Dispatches a route through the browser pipeline.

#### Parameters

##### path

`string`

The route path, e.g. `/account/settings`.

#### Returns

`Promise`\<[`CapturedRender`](../../memory-view-target/interfaces/CapturedRender.md)\>

The captured render (output element + model).
