[**@ndigo/telemetry-node v0.0.1**](../README.md)

***

[@ndigo/telemetry-node](../README.md) / HTTPResponseViewTargetInstrumentation

# Class: HTTPResponseViewTargetInstrumentation

Instrumentation for `HTTPResponseViewTarget.commit`.

## Example

```ts
configureTelemetry({
  instrumentations: [new HTTPResponseViewTargetInstrumentation()],
});
```

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new HTTPResponseViewTargetInstrumentation**(): `HTTPResponseViewTargetInstrumentation`

#### Returns

`HTTPResponseViewTargetInstrumentation`

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
