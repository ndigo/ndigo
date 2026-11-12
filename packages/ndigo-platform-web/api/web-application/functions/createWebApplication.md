[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [web-application](../README.md) / createWebApplication

# Function: createWebApplication()

> **createWebApplication**(`sources`, `options?`): `Promise`\<[`WebApplication`](../interfaces/WebApplication.md)\>

Creates a browser application: builds the context (`WebAutoConfiguration`
and `BrowserEnvironment` by default), then wires the runtime routes flow
through — a `DOMElementViewTarget` for the render root, a
`BrowserDispatcher` for handler dispatch, and a `HashRouter` for hash
navigation — and performs the first navigation.

Composes the existing pieces rather than replacing them — the returned
context is the same container `ApplicationBuilder` would have produced, so
every entry stays reachable and full manual control remains one
`ApplicationBuilder` away. Startup failures are logged, the context is
torn down, and the error is rethrown.

## Parameters

### sources

readonly `Function`[]

Application source classes (configurations, controllers, …).

### options?

[`CreateWebApplicationOptions`](../interfaces/CreateWebApplicationOptions.md) = `{}`

Preset options; every implicit action has an opt-out.

## Returns

`Promise`\<[`WebApplication`](../interfaces/WebApplication.md)\>

The booted application.

## Example

```ts
const app = await createWebApplication([AppConfiguration]);
// app.context   — the refreshed DI container
// app.dispatcher / app.router / app.viewTarget — the runtime
// app.destroy() — teardown
```
