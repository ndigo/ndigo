[**@ndigo/telemetry-node v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry-node](../../../../README.md) / [instrumentation/server-sent-event-view/server-sent-event-view](../README.md) / ServerSentEventViewInstrumentation

# Class: ServerSentEventViewInstrumentation

Instrumentation for `ServerSentEventView.renderTo` streaming.

## Example

```ts
configureTelemetry({
  instrumentations: [new ServerSentEventViewInstrumentation()],
});
```

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new ServerSentEventViewInstrumentation**(): `ServerSentEventViewInstrumentation`

#### Returns

`ServerSentEventViewInstrumentation`

#### Overrides

`AbstractBaseInstrumentation.constructor`

## Methods

### disable()

> **disable**(): `void`

Restores the original `renderTo` method.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Patches `ServerSentEventView#renderTo` to record SSE rendering spans and
byte counts.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
