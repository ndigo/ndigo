[**@ndigo/telemetry v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry](../../../../README.md) / [instrumentation/dispatcher/dispatcher](../README.md) / DispatcherInstrumentation

# Class: DispatcherInstrumentation

An OpenTelemetry instrumentation for the `@ndigo/dispatcher` package.

This instrumentation automatically creates spans for the `dispatch` method,
providing visibility into route dispatching processes.

## Extends

- [`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md)

## Constructors

### Constructor

> **new DispatcherInstrumentation**(): `DispatcherInstrumentation`

#### Returns

`DispatcherInstrumentation`

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
