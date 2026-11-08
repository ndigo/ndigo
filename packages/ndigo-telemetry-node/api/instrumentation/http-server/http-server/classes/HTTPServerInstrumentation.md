[**@ndigo/telemetry-node v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry-node](../../../../README.md) / [instrumentation/http-server/http-server](../README.md) / HTTPServerInstrumentation

# Class: HTTPServerInstrumentation

Instrumentation for `HTTPServer.listen`/`close` and per-request handling.

## Example

```ts
configureTelemetry({
  instrumentations: [new HTTPServerInstrumentation()],
});
```

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new HTTPServerInstrumentation**(): `HTTPServerInstrumentation`

#### Returns

`HTTPServerInstrumentation`

#### Overrides

`AbstractBaseInstrumentation.constructor`

## Methods

### disable()

> **disable**(): `void`

Restores the original `start` and `close` methods.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Patches `HTTPServer#start` and `#close` to record server lifecycle spans.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
