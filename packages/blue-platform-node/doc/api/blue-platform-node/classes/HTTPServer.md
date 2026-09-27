[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / HTTPServer

# Class: HTTPServer

A managed HTTP server that delegates incoming requests to a [NodeDispatcher](NodeDispatcher.md).

Implements `SmartLifecycle` so the context stops it on `close()`, and
`ApplicationContextAware` so it can resolve the dispatcher from the context
when none is supplied to the constructor. `isAutoStartup` is `false`:
registering a `NodeAutoConfiguration` context must not bind ports during
`refresh()` — applications start the server explicitly once their handler
mapping and dispatcher strategies are ready.

## Example

```ts
const server = context.getValue<HTTPServer>('httpServer');
await server.start();
// ... later
context.close(); // stops the server
```

## Implements

- `SmartLifecycle`
- `ApplicationContextAware`

## Constructors

### Constructor

> **new HTTPServer**(`dispatcher?`, `options?`): `HTTPServer`

Create a new HTTP server.

#### Parameters

##### dispatcher?

[`NodeDispatcher`](NodeDispatcher.md) \| `null`

The dispatcher to handle incoming requests. When
omitted, the dispatcher is resolved from the application context at
start time.

##### options?

[`HTTPServerOptions`](../interfaces/HTTPServerOptions.md) = `{}`

Server configuration.

#### Returns

`HTTPServer`

## Properties

### isAutoStartup

> `readonly` **isAutoStartup**: `false` = `false`

`SmartLifecycle` — never auto-start; the application starts the server explicitly.

#### Implementation of

`SmartLifecycle.isAutoStartup`

***

### phase

> `readonly` **phase**: `0` = `0`

`SmartLifecycle` — start/stop ordering.

#### Implementation of

`SmartLifecycle.phase`

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Marks the value as `Aware` for the factory's aware injection, so
`setApplicationContext` is invoked when the entry is registered.

##### Returns

`boolean`

#### Implementation of

`ApplicationContextAware.[$aware]`

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

`SmartLifecycle` — whether the server is currently listening.

##### Returns

`boolean`

#### Implementation of

`SmartLifecycle.isRunning`

***

### port

#### Get Signature

> **get** **port**(): `number`

The port the server is listening on, or `0` if not yet started.

##### Returns

`number`

***

### server

#### Get Signature

> **get** **server**(): `unknown`

The underlying adapter (e.g. the `http.Server` instance).

##### Returns

`unknown`

***

### started

#### Get Signature

> **get** **started**(): `boolean`

Whether the server has been started.

##### Returns

`boolean`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Stop the server gracefully. Idempotent.

#### Returns

`Promise`\<`void`\>

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Injects the owning application context, used to resolve the dispatcher.

#### Parameters

##### context

`ApplicationContext`

The application context that owns this server.

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`

***

### start()

> **start**(): `Promise`\<`void`\>

Start listening. Idempotent: concurrent callers share the same start
until the server is closed, after which a fresh start can be issued.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SmartLifecycle.start`

***

### stop()

> **stop**(): `Promise`\<`void`\>

`SmartLifecycle` — stop the server, delegated to [close](#close).

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SmartLifecycle.stop`
