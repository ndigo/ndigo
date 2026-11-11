[**@ndigo/telemetry-web v0.0.1**](../../README.md)

***

[@ndigo/telemetry-web](../../README.md) / [index](../README.md) / ContextInstrumentation

# Class: ContextInstrumentation

An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.

This instrumentation automatically creates spans for the `destroy` and
`refresh` methods, providing visibility into application context teardown
and refresh processes.

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

Restores the original `destroy` and `refresh` methods.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Patches `GenericApplicationContext#destroy` and `#refresh` to record spans.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
