[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / CountedInstrumentation

# Class: CountedInstrumentation

An OpenTelemetry instrumentation that automatically wraps methods decorated with `counted`.

This instrumentation discovers decorated methods via the `CountedRegistry` and
applies the counting logic using the instrumentation's patching mechanism.

## Extends

- [`AbstractBaseInstrumentation`](AbstractBaseInstrumentation.md)

## Constructors

### Constructor

> **new CountedInstrumentation**(): `CountedInstrumentation`

#### Returns

`CountedInstrumentation`

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
