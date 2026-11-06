[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [run-node-application](../README.md) / runNodeApplication

# Function: runNodeApplication()

> **runNodeApplication**(`sources`, `options?`): `Promise`\<[`NodeApplication`](../interfaces/NodeApplication.md)\>

Runs a Node application: builds the context (`NodeAutoConfiguration` and
`NodeEnvironment` by default), loads config files, starts the managed
`HTTP_SERVER`, and wires `SIGINT`/`SIGTERM` to a graceful teardown.

Composes the existing pieces rather than replacing them — the returned
context is the same container `ApplicationBuilder` would have produced, so
every bean stays reachable and full manual control remains one
`ApplicationBuilder` away. Startup failures are logged and rethrown (never
`process.exit`); the caller's top-level `await` decides the exit code.

## Parameters

### sources

readonly `Function`[]

Application source classes (configurations, controllers, …).

### options?

[`RunNodeApplicationOptions`](../interfaces/RunNodeApplicationOptions.md) = `{}`

Preset options; every implicit action has an opt-out.

## Returns

`Promise`\<[`NodeApplication`](../interfaces/NodeApplication.md)\>

The booted application.

## Example

```ts
const app = await runNodeApplication([AppConfiguration], { port: 3000 });
logger.info(`listening on http://127.0.0.1:${app.port}`);
```
