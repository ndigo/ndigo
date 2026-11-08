[**@ndigo/telemetry-node v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry-node](../../../../README.md) / [instrumentation/http-response-view-target/http-response-view-target](../README.md) / HTTPResponseViewTargetInstrumentation

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

Restores the original `commit` method.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Patches `HTTPResponseViewTarget#commit` to record response-render spans.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
