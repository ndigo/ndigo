[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / ContextInstrumentation

# Class: ContextInstrumentation

An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.

This instrumentation automatically creates spans for the `destroy` method,
providing visibility into application context teardown processes.

## Extends

- [`AbstractBaseInstrumentation`](AbstractBaseInstrumentation.md)

## Constructors

### Constructor

> **new ContextInstrumentation**(): `ContextInstrumentation`

#### Returns

`ContextInstrumentation`

#### Overrides

[`AbstractBaseInstrumentation`](AbstractBaseInstrumentation.md).[`constructor`](AbstractBaseInstrumentation.md#constructor)

## Methods

### disable()

> **disable**(): `void`

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](AbstractBaseInstrumentation.md).[`disable`](AbstractBaseInstrumentation.md#disable)

***

### enable()

> **enable**(): `void`

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](AbstractBaseInstrumentation.md).[`enable`](AbstractBaseInstrumentation.md#enable)
