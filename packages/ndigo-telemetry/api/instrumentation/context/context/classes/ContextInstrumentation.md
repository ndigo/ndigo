[**@ndigo/telemetry v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry](../../../../README.md) / [instrumentation/context/context](../README.md) / ContextInstrumentation

# Class: ContextInstrumentation

An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.

This instrumentation automatically creates spans for the `destroy` and
`refresh` methods, providing visibility into application context teardown
and refresh processes.

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

Restores the original `destroy` and `refresh` methods.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`disable`](../../../base/classes/AbstractBaseInstrumentation.md#disable)

***

### enable()

> **enable**(): `void`

Patches `GenericApplicationContext#destroy` and `#refresh` to record spans.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`enable`](../../../base/classes/AbstractBaseInstrumentation.md#enable)
