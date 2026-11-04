[**@ndigo/telemetry-web v0.0.1**](../README.md)

***

[@ndigo/telemetry-web](../README.md) / RouterInstrumentation

# Class: RouterInstrumentation

An OpenTelemetry instrumentation for the `@ndigo/router` package, specifically `HashRouter`.

This instrumentation automatically creates spans for the internal `_setRoute` method,
providing visibility into route change events within the application.

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new RouterInstrumentation**(): `RouterInstrumentation`

#### Returns

`RouterInstrumentation`

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
