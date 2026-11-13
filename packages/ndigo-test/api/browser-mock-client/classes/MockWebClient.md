[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [browser-mock-client](../README.md) / MockWebClient

# Class: MockWebClient

Socket-free mock MVC client for browser applications. Dispatches routes
through the real `BrowserDispatcher` and captures the rendered view.

Applications that install `viewTargeters` decide their own destinations:
when a targeter matches, the render goes there and the capture target stays
empty — assert that destination, or render a result that carries an explicit
`ModelAndView.viewTarget`.

## Constructors

### Constructor

> **new MockWebClient**(`app`): `MockWebClient`

Creates a client around a booted browser app.

#### Parameters

##### app

[`BrowserTestApp`](../interfaces/BrowserTestApp.md)

A booted browser app.

#### Returns

`MockWebClient`

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

The capture target is reset first, so a render that the app's
`viewTargeters` send elsewhere can never surface as the previous
dispatch's stale render.

#### Parameters

##### path

`string`

The route path, e.g. `/account/settings`.

#### Returns

`Promise`\<[`CapturedRender`](../../memory-view-target/interfaces/CapturedRender.md)\>

The captured render (output element + model).

#### Throws

When nothing landed in the capture target — a handler mismatch,
  or a `viewTargeters` chain that redirected the render.
