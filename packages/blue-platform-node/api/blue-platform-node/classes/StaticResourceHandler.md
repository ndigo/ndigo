[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / StaticResourceHandler

# Class: StaticResourceHandler

The HTTP half of static serving: one `handle(route, requestPath)` call
turns a path into a complete response (D-5).

Flow: resolve (with variant negotiation) → conditional GET (D-2) → single
range (D-4) → cache headers → body. Handles GET and HEAD; errors are
problem+json documents; 404 file misses may fall back to the SPA index
(D-6). Writes directly, because status/header combinations like 206/304/416
cannot flow through `ResponseEntityView`.

## Constructors

### Constructor

> **new StaticResourceHandler**(`basePath`, `options?`): `StaticResourceHandler`

Creates a handler over a static root.

#### Parameters

##### basePath

`string`

The directory to serve files from.

##### options?

[`StaticHandlerOptions`](../interfaces/StaticHandlerOptions.md) = `{}`

Handler options (D-6).

#### Returns

`StaticResourceHandler`

## Methods

### handle()

> **handle**(`route`, `requestPath`): `Promise`\<`void`\>

Serves `requestPath` for the route's request, writing the response.

#### Parameters

##### route

[`Route`](#)

The current route (carries the Node request/response).

##### requestPath

`string`

The request-relative path to serve (raw, undecoded).

#### Returns

`Promise`\<`void`\>
