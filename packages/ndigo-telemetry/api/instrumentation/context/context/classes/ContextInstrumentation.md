[**@ndigo/telemetry v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry](../../../../README.md) / [instrumentation/context/context](../README.md) / ContextInstrumentation

# Class: ContextInstrumentation

An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.

This instrumentation automatically creates spans for the `destroy` method,
providing visibility into application context teardown processes.

## Extends

- [`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md)

## Constructors

### Constructor

> **new ContextInstrumentation**(): `ContextInstrumentation`

#### Returns

`ContextInstrumentation`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`constructor`](../../../base/classes/AbstractBaseInstrumentation.md#constructor)

## Methods

### disable()

> **disable**(): `void`

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`disable`](../../../base/classes/AbstractBaseInstrumentation.md#disable)

***

### enable()

> **enable**(): `void`

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`enable`](../../../base/classes/AbstractBaseInstrumentation.md#enable)
