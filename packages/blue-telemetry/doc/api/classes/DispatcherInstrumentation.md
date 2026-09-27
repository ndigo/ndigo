[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / DispatcherInstrumentation

# Class: DispatcherInstrumentation

An OpenTelemetry instrumentation for the `@blue/dispatcher` package.

This instrumentation automatically creates spans for the `dispatch` method,
providing visibility into route dispatching processes.

## Extends

- [`AbstractBaseInstrumentation`](AbstractBaseInstrumentation.md)

## Constructors

### Constructor

> **new DispatcherInstrumentation**(): `DispatcherInstrumentation`

#### Returns

`DispatcherInstrumentation`

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
