[**@blue/telemetry-node v0.0.1**](../README.md)

***

[@blue/telemetry-node](../README.md) / HTTPServerInstrumentation

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

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
