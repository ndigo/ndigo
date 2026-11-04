[**@ndigo/telemetry-web v0.0.1**](../README.md)

***

[@ndigo/telemetry-web](../README.md) / ContextInstrumentation

# Class: ContextInstrumentation

An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.

This instrumentation automatically creates spans for the `destroy` method,
providing visibility into application context teardown processes.

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new ContextInstrumentation**(): `ContextInstrumentation`

#### Returns

`ContextInstrumentation`

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
