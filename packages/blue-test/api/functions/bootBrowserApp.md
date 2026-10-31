[**@blue/test v0.0.1**](../README.md)

***

[@blue/test](../README.md) / bootBrowserApp

# Function: bootBrowserApp()

> **bootBrowserApp**(`sources`): `Promise`\<[`BrowserTestApp`](../interfaces/BrowserTestApp.md)\>

Boot a browser application from configuration/controller classes, wiring the
browser dispatcher and a [MemoryViewTarget](../classes/MemoryViewTarget.md). Requires a DOM (jsdom).

## Parameters

### sources

`Function`[]

Application configuration and/or controller classes.

## Returns

`Promise`\<[`BrowserTestApp`](../interfaces/BrowserTestApp.md)\>

A booted browser app exposing the context, dispatcher, and capture target.

## Example

```ts
const app = await bootBrowserApp([ToDoconfiguration]);
const browser = new BrowserMockClient(app);
await browser.dispatch('/account');
expect(app.viewTarget.lastRender?.model).toEqual({ section: 'overview' });
```
