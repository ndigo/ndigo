[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / BrowserMockMVC

# Class: BrowserMockMVC

Defined in: [packages/blue-test/src/browser-mock-mvc.ts:123](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/browser-mock-mvc.ts#lines-123)

Socket-free mock MVC client for browser applications. Dispatches routes
through the real `BrowserDispatcher` and captures the rendered view.

## Constructors

### Constructor

> **new BrowserMockMVC**(`app`): `BrowserMockMVC`

Defined in: [packages/blue-test/src/browser-mock-mvc.ts:129](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/browser-mock-mvc.ts#lines-129)

#### Parameters

##### app

[`BrowserTestApp`](../interfaces/BrowserTestApp.md)

A booted browser app.

#### Returns

`BrowserMockMVC`

## Accessors

### lastRender

#### Get Signature

> **get** **lastRender**(): [`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

Defined in: [packages/blue-test/src/browser-mock-mvc.ts:161](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/browser-mock-mvc.ts#lines-161)

The captured render from the last dispatch.

##### Returns

[`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

## Methods

### dispatch()

> **dispatch**(`path`): `Promise`\<[`CapturedRender`](../interfaces/CapturedRender.md)\>

Defined in: [packages/blue-test/src/browser-mock-mvc.ts:139](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/browser-mock-mvc.ts#lines-139)

Dispatches a route through the browser pipeline.

#### Parameters

##### path

`string`

The route path, e.g. `/account/settings`.

#### Returns

`Promise`\<[`CapturedRender`](../interfaces/CapturedRender.md)\>

The captured render (output element + model).
